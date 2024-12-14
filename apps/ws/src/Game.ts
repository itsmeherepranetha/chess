import { WebSocket } from "ws";
import { Chess } from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import prisma from './prisma_script';
import {randomUUID} from "crypto";

export class Game{
    public gameId:string;
    public player1:WebSocket | null;
    public player2:WebSocket | null;
    public chess:Chess;
    private startTime:Date;
    private moveCount=0;

    constructor(player1:WebSocket,player2:WebSocket | null)
    {
        this.player1=player1;
        this.player2=player2;
        this.chess=new Chess();
        this.startTime=new Date();
        this.gameId=randomUUID();
    }
    
    async createGameInDb()
    {
        const game = await prisma.game.create({
            // TODO: Add user detials when auth is complete
            data: {
                id: this.gameId,
                timeControl: "CLASSICAL",
                status: "IN_PROGRESS",
                currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                whitePlayer: {
                    create: {},
                },
                blackPlayer: {
                    create: {},
                },
            },
            include: {
                whitePlayer: true,
                blackPlayer: true,
            }
        })

        //why is this needed?
        this.gameId = game.id;
    }

    async createGameHandler()
    {
        try{
            await this.createGameInDb(); 
        } 
        catch(e){
            console.error(e)
            return;
        }
        if(this.player1)
        {
            this.player1.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "white",
                    gameId: this.gameId
                }
            }));
        }
        if(this.player2)
        {
            this.player2.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "black",
                    gameId: this.gameId
                }
            }));
        }
    }


    async addMoveToDb(move: {
        from: string;
        to: string;
    }) {
        await prisma.$transaction([
            prisma.move.create({
                data: {
                    gameId: this.gameId,
                    moveNumber: this.moveCount + 1,
                    startFen: move.from,
                    endFen: move.to,
                    createdAt: new Date(Date.now()),
                    notation: this.chess.fen()
                },
            }), 
            prisma.game.update({
                data: {
                    currentFen: this.chess.fen()
                },
                where: {
                    id: this.gameId
                }
            })
        ])
    }


    async makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }) {
        // validate the type of move using zod
        if(this.moveCount % 2 === 0 && socket !== this.player1) {
            return
        }
        if(this.moveCount % 2 === 1 && socket !== this.player2) {
            return;
        }
        try{
            this.chess.move(move);
        } 
        catch(e){
            console.log(e);
            return;
        }
        await this.addMoveToDb(move);
        if (this.chess.isGameOver()) 
        {
            // Send the game over message to both players
            if (this.player1) {
                this.player1.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.chess.turn() === "w" ? "black" : "white"
                    }
                }))
            }
            if (this.player2) {
                this.player2.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.chess.turn() === "w" ? "black" : "white"
                    }
                }))
            }
            return;
        }
        if (this.moveCount % 2 === 0) 
        {
            if (this.player2)
            {
                this.player2.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }));
            }
        } 
        else 
        {
            if (this.player1)
            {
                this.player1.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }));
            }
        }
        this.moveCount++;
    }
}

   