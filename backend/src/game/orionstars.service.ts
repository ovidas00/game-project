import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Redis } from 'ioredis';
import { createHash } from 'crypto';

@Injectable()
export class OrionstarsService {
  private readonly baseUrl = 'https://orionstars.vip:8033/ws/service.ashx';
  private readonly agentName = 'Legend121';
  private readonly agentPasswd = '我Hero1212@#';
  private readonly cacheKey = 'orionstars:agentkey';

  constructor(
    private readonly http: HttpService,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private md5(value: string): string {
    return createHash('md5').update(value).digest('hex');
  }

  private timestamp(): number {
    return Date.now();
  }

  /**
   * sign = md5(agentName.toLowerCase() + time.toString() + agentKey.toLowerCase())
   */
  private buildSign(time: number, agentKey: string): string {
    return this.md5(
      this.agentName.toLowerCase() + time.toString() + agentKey.toLowerCase(),
    );
  }

  private buildUrl(
    action: string,
    params: Record<string, string | number>,
  ): string {
    const query = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    );
    return `${this.baseUrl}?action=${action}&${query.toString()}`;
  }

  // ─── Authentication ────────────────────────────────────────────────────────

  async login(): Promise<string> {
    const time = this.timestamp();
    const url = this.buildUrl('agentLogin', {
      agentName: this.agentName,
      agentPasswd: this.md5(this.agentPasswd),
      time,
    });

    const { data } = await this.http.axiosRef.post(url);

    if (data?.code !== '200' || !data?.agentkey) {
      throw new BadRequestException(
        `Login failed: ${data?.msg ?? 'no agentkey returned'}`,
      );
    }

    // Cache for 4.5 hours
    await this.redis.set(this.cacheKey, data.agentkey, 'EX', 16200);

    return data.agentkey;
  }

  async getAgentKey(): Promise<string> {
    const cached = await this.redis.get(this.cacheKey);
    if (cached) return cached;
    return this.login();
  }

  // user management

  async registerUser(account: string, passwd: string) {
    const agentKey = await this.getAgentKey();
    const time = this.timestamp();
    const url = this.buildUrl('registerUser', {
      account,
      passwd: this.md5(passwd),
      agentName: this.agentName,
      time,
      sign: this.buildSign(time, agentKey),
    });

    const { data } = await this.http.axiosRef.post(url);

    if (data?.code !== '200') {
      throw new BadRequestException(
        `Register failed: ${data?.msg ?? 'unknown error'}`,
      );
    }

    return { account, apiResponse: data };
  }

  async queryUserInfo(account: string, passwd: string) {
    const agentKey = await this.getAgentKey();
    const time = this.timestamp();
    const url = this.buildUrl('queryInfo', {
      account,
      passwd: this.md5(passwd),
      agentName: this.agentName,
      time,
      sign: this.buildSign(time, agentKey),
    });

    const { data } = await this.http.axiosRef.post(url);

    if (data?.code !== '200') {
      throw new BadRequestException(
        `Query failed: ${data?.msg ?? 'unknown error'}`,
      );
    }

    return {
      agentBalance: data.agentBalance,
      gameId: data.gameId,
      userBalance: data.userbalance,
      webLoginUrl: data.webLoginUrl,
    };
  }

  async changePassword(account: string, passwd: string, passwdNew: string) {
    const agentKey = await this.getAgentKey();
    const time = this.timestamp();
    const url = this.buildUrl('changePasswd', {
      account,
      passwd: this.md5(passwd),
      passwdNew: this.md5(passwdNew),
      agentName: this.agentName,
      time,
      sign: this.buildSign(time, agentKey),
    });

    const { data } = await this.http.axiosRef.post(url);

    if (data?.code !== '200') {
      throw new BadRequestException(
        `Password change failed: ${data?.msg ?? 'unknown error'}`,
      );
    }

    return { account, apiResponse: data };
  }

  // ─── Balance Operations ───────────────────────────────────────────────────

  async recharge(account: string, amount: number) {
    if (!account) throw new BadRequestException('Account is required');
    if (!amount || amount <= 0)
      throw new BadRequestException('Amount must be a positive number');

    const agentKey = await this.getAgentKey();
    const time = this.timestamp();
    const url = this.buildUrl('recharge', {
      account,
      amount,
      agentName: this.agentName,
      time,
      sign: this.buildSign(time, agentKey),
    });

    const { data } = await this.http.axiosRef.post(url);

    if (data?.code !== '200') {
      throw new BadRequestException(
        `Recharge failed: ${data?.msg ?? 'unknown error'}`,
      );
    }

    return { account, amount, apiResponse: data };
  }

  async redeem(account: string, amount: number) {
    if (!account) throw new BadRequestException('Account is required');
    if (!amount || amount <= 0)
      throw new BadRequestException('Amount must be a positive number');

    const agentKey = await this.getAgentKey();
    const time = this.timestamp();
    const url = this.buildUrl('redeem', {
      account,
      amount,
      agentName: this.agentName,
      time,
      sign: this.buildSign(time, agentKey),
    });

    const { data } = await this.http.axiosRef.post(url);

    if (data?.code !== '200') {
      throw new BadRequestException(
        `Redeem failed: ${data?.msg ?? 'unknown error'}`,
      );
    }

    return { account, amount, apiResponse: data };
  }

  // records

  async getTradeRecord(account: string, fromDate: string, toDate: string) {
    const agentKey = await this.getAgentKey();
    const time = this.timestamp();
    const url = this.buildUrl('getTradeRecord', {
      agentName: this.agentName,
      account,
      fromDate,
      toDate,
      time,
      sign: this.buildSign(time, agentKey),
    });

    const { data } = await this.http.axiosRef.post(url);

    if (data?.code !== '200') {
      throw new BadRequestException(
        `Trade record fetch failed: ${data?.msg ?? 'unknown error'}`,
      );
    }

    return {
      account,
      fromDate,
      toDate,
      records: data.data ?? [],
    };
  }

  async getJpRecord(account: string, fromDate: string, toDate: string) {
    const agentKey = await this.getAgentKey();
    const time = this.timestamp();
    const url = this.buildUrl('getJpRecord', {
      agentName: this.agentName,
      account,
      fromDate,
      toDate,
      time,
      sign: this.buildSign(time, agentKey),
    });

    const { data } = await this.http.axiosRef.post(url);

    if (data?.code !== '200') {
      throw new BadRequestException(
        `JP record fetch failed: ${data?.msg ?? 'unknown error'}`,
      );
    }

    return {
      account,
      fromDate,
      toDate,
      records: data.data ?? [],
    };
  }

  async getGameRecord(account: string) {
    const agentKey = await this.getAgentKey();
    const time = this.timestamp();
    const url = this.buildUrl('getGameRecord', {
      agentName: this.agentName,
      account,
      time,
      sign: this.buildSign(time, agentKey),
    });

    const { data } = await this.http.axiosRef.post(url);

    if (data?.code !== '200') {
      throw new BadRequestException(
        `Game record fetch failed: ${data?.msg ?? 'unknown error'}`,
      );
    }

    return {
      account,
      records: data.data ?? [],
    };
  }
}
