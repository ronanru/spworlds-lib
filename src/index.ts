// Copyright 2022 Matvey Ryabchikov
// MIT License

import { createHmac, timingSafeEqual } from 'crypto';
import fetch from 'node-fetch';

export class SPWorlds {
  private authHeader: string;
  private token: string;

  private fetchApi = (
    path: string,
    body: Record<string, unknown> | null,
    getResult: boolean
  ): any =>
    fetch(`https://spworlds.ru/api/public/${path}`, {
      method: body === null ? 'GET' : 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: { Authorization: this.authHeader, 'Content-Type': 'application/json' }
    }).then(res => {
      if (![200, 404].includes(res.status))
        throw new Error(`Ошибка при запросе к API ${res.status} ${res.statusText}`);
      if (getResult) return res.json();
    });

  /**
   * @param cardId ID карты
   * @param cardToken Секретный токен карты
   */
  constructor(cardId: string, cardToken: string) {
    this.authHeader = `Bearer ${Buffer.from(`${cardId}:${cardToken}`).toString('base64')}`;
    this.token = cardToken;
  }

  /**
   *
   * @param amount Стоимость покупки в АРах
   * @param redirectUrl Ссылка успешной оплаты, на которую перенаправят пользователя после успешной оплаты
   * @param webhookUrl Ссылка вебхука, на которую придет вебхук об успешной оплате
   * @param data Любые полезные данные пользователя
   * @returns URL оплаты
   */
  initPayment = (
    amount: number,
    redirectUrl: string,
    webhookUrl?: string,
    data?: string
  ): Promise<string> =>
    this.fetchApi(
      'payment',
      { amount, redirectUrl, webhookUrl: webhookUrl || null, data: data || null },
      true
    ).then(({ url }: { url: string }) => url);

  /**
   * Переводит АРы с карты кому-то еще
   * @param receiver Номер карты получателя
   * @param amount Кол-во аров
   * @param comment Комментарий к переводу
   */
  createTransaction = (receiver: string, amount: number, comment: string): Promise<void> =>
    this.fetchApi('transactions', { receiver, amount, comment }, false).then(() => {});

  /**
   * Узнает баланс АРов на карте
   * @returns Баланс карты
   */
  getCardBalance = (): Promise<number> =>
    this.fetchApi('card', null, true).then(({ balance }: { balance: number }) => balance);

  /**
   * Получает ник игрока по discord id
   * @param discordId ID игрока в дискорде
   * @returns Ник игрока
   */
  findUser = (discordId: string): Promise<string | null> =>
    this.fetchApi(`users/${discordId}`, null, true).then(
      ({ username }: { username: string | null }) => username
    );

  /**
   * Проверяет валидность вебхука
   * @param body Все данные, пришедшие по вебхуку
   * @param hashHeader Значение хедера `X-Body-Hash`
   */
  verifyHash = (body: string | object, hashHeader: string): boolean =>
    timingSafeEqual(
      Buffer.from(
        createHmac('sha256', this.token)
          .update(typeof body === 'string' ? body : JSON.stringify(body))
          .digest('base64')
      ),
      Buffer.from(hashHeader)
    );
}
