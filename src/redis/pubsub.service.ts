/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { Injectable, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class PubsubService implements OnModuleInit{

    private publisher: Redis;
    private subscriber: Redis;

    onModuleInit() {
        this.publisher = new Redis();
        this.subscriber = new Redis();

        this.subscriber.subscribe('url_visits', (err, count) => { 
            if (!err) console.log(`Subscribed to ${count} channel(s).`);
        })

        this.subscriber.on('message', (channel, message) => {
            const data = JSON.parse(message);
            console.log(`Received message from ${channel}:`, data);
        })
    }

    async publish(channel: string, message: any) {
        await this.publisher.publish(channel, JSON.stringify(message));
    }
}