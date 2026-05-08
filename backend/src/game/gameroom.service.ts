import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Redis } from 'ioredis';
import { randomBytes } from 'crypto';

@Injectable()
export class GameroomService {
  private readonly baseUrl = 'https://agentserver.gameroom777.com/api';
  private readonly cacheKey = 'gameroom777:token';

  constructor(
    private readonly http: HttpService,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async login(): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('username', 'Legend121');
    formData.append('password', 'Hero@#1233');

    const { data } = await this.http.axiosRef.post(
      `${this.baseUrl}/agent/login`,
      formData,
    );

    const token = data?.data?.token;

    if (!token) {
      throw new BadRequestException('Login failed: token not received');
    }

    await this.redis.set(this.cacheKey, token, 'EX', 18000);

    return token;
  }

  async getAgentToken(): Promise<string> {
    const cachedToken = await this.redis.get(this.cacheKey);
    if (cachedToken) return cachedToken;

    const token = await this.login();

    return token;
  }

  async getPlayerList(
    limit = 10,
    page = 1,
    filters?: { id?: string; account?: string; nickname?: string },
  ) {
    const token = await this.getAgentToken();

    // Build params dynamically
    const params: Record<string, any> = {
      limit,
      page,
    };

    if (filters?.id) params.Id = filters.id;
    if (filters?.account) params.account = filters.account;
    if (filters?.nickname) params.nickname = filters.nickname;

    const { data } = await this.http.axiosRef.get(
      `${this.baseUrl}/player/playerList`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const total = data?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data?.data ?? [],
      meta: { page: Number(page), limit: Number(limit), total, totalPages },
    };
  }

  async addPlayer(
    username?: string,
    nickname?: string,
    password?: string,
    money: number = 0,
  ) {
    const token = await this.getAgentToken();

    // fallback if not provided
    const finalUsername =
      username || randomBytes(6).toString('hex').slice(0, 10);

    const finalNickname = nickname || finalUsername;

    const finalPassword = password || randomBytes(6).toString('hex');

    const formData = new URLSearchParams();
    formData.append('username', finalUsername);
    formData.append('nickname', finalNickname);
    formData.append('password', finalPassword);
    formData.append('money', money.toString());

    const { data } = await this.http.axiosRef.post(
      `${this.baseUrl}/player/insertPlayer`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return {
      username: finalUsername,
      password: finalPassword,
      apiResponse: data,
    };
  }
  async getPlayerScore(id: string): Promise<number> {
    const token = await this.getAgentToken();

    const { data } = await this.http.axiosRef.get(
      `${this.baseUrl}/player/getScore`,
      {
        params: { id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return Number(data?.data?.balance ?? 0);
  }

  async recharge(id: string, balance: number, remark?: string) {
    const token = await this.getAgentToken();

    if (!id) {
      throw new BadRequestException('Player ID is required');
    }

    if (balance === undefined || balance === null) {
      throw new BadRequestException('Balance is required');
    }

    const finalRemark = remark || 'Recharge';

    const formData = new URLSearchParams();
    formData.append('id', id);
    formData.append('balance', balance.toString());
    formData.append('remark', finalRemark);

    const { data } = await this.http.axiosRef.post(
      `${this.baseUrl}/player/playerRecharge`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return {
      id,
      balance,
      remark: finalRemark,
      apiResponse: data,
    };
  }

  async withdraw(id: string, balance: number, remark?: string) {
    const token = await this.getAgentToken();

    if (!id) {
      throw new Error('Player ID is required');
    }

    if (balance === undefined || balance === null) {
      throw new Error('Balance is required');
    }

    const finalRemark = remark || 'Withdraw';

    const formData = new URLSearchParams();
    formData.append('id', id);
    formData.append('balance', balance.toString());
    formData.append('remark', finalRemark);

    const { data } = await this.http.axiosRef.post(
      `${this.baseUrl}/player/playerWithdraw`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return {
      id,
      balance,
      remark: finalRemark,
      apiResponse: data,
    };
  }

  async reset(id: string, password: string, passwordConfirmation: string) {
    const token = await this.getAgentToken();

    if (!id) {
      throw new BadRequestException('Player ID is required');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    if (!passwordConfirmation) {
      throw new BadRequestException('Password confirmation is required');
    }

    if (password !== passwordConfirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    const formData = new URLSearchParams();
    formData.append('id', id);
    formData.append('password', password);
    formData.append('password_confirmation', passwordConfirmation);

    const { data } = await this.http.axiosRef.post(
      `${this.baseUrl}/player/reset`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return {
      id,
      password,
      apiResponse: data,
    };
  }
}
