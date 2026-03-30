"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BOARD_SIZE,
  TICK_MS,
  createInitialGameState,
  queueDirection,
  stepGame,
  togglePause,
} from "@/lib/snakeGame";

const CONTROL_KEYS = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
  w: "UP",
  W: "UP",
  s: "DOWN",
  S: "DOWN",
  a: "LEFT",
  A: "LEFT",
  d: "RIGHT",
  D: "RIGHT",
};

function getCellType(cell, snake, food) {
  if (food && food.x === cell.x && food.y === cell.y) {
    return "food";
  }

  if (snake[0].x === cell.x && snake[0].y === cell.y) {
    return "head";
  }

  if (snake.some((segment, index) => index > 0 && segment.x === cell.x && segment.y === cell.y)) {
    return "body";
  }

  return "empty";
}

export default function SnakeGame() {
  const [game, setGame] = useState(() => createInitialGameState(BOARD_SIZE));

  const cells = useMemo(() => {
    const board = [];

    for (let y = 0; y < game.boardSize; y += 1) {
      for (let x = 0; x < game.boardSize; x += 1) {
        board.push({ x, y });
      }
    }

    return board;
  }, [game.boardSize]);

  useEffect(() => {
    if (game.status !== "running") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setGame((currentGame) => stepGame(currentGame));
    }, TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [game.status]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const requestedDirection = CONTROL_KEYS[event.key];

      if (requestedDirection) {
        event.preventDefault();

        setGame((currentGame) => {
          const nextGame = queueDirection(currentGame, requestedDirection);

          if (currentGame.status === "idle") {
            return { ...nextGame, status: "running" };
          }

          return nextGame;
        });

        return;
      }

      if (event.key === " " || event.key === "p" || event.key === "P") {
        event.preventDefault();
        setGame((currentGame) => togglePause(currentGame));
      }

      if (event.key === "Enter" && game.status === "game-over") {
        event.preventDefault();
        setGame(createInitialGameState(BOARD_SIZE));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game.status]);

  const handleDirectionPress = (direction) => {
    setGame((currentGame) => {
      const nextGame = queueDirection(currentGame, direction);

      if (currentGame.status === "idle") {
        return { ...nextGame, status: "running" };
      }

      return nextGame;
    });
  };

  const handleRestart = () => {
    setGame(createInitialGameState(BOARD_SIZE));
  };

  const handlePause = () => {
    setGame((currentGame) => togglePause(currentGame));
  };

  const statusLabel =
    game.status === "game-over"
      ? "Game over"
      : game.status === "paused"
        ? "Paused"
        : game.status === "running"
          ? "Running"
          : "Ready";

  return (
    <section className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Snake</h1>
          <p className="text-sm text-gray-300">
            Use arrow keys or WASD to move. Press space to pause.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm">
            Score: <span className="font-semibold text-white">{game.score}</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-gray-300">
            {statusLabel}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div
          className="grid aspect-square w-full max-w-[32rem] overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0F]"
          style={{ gridTemplateColumns: `repeat(${game.boardSize}, minmax(0, 1fr))` }}
        >
          {cells.map((cell) => {
            const cellType = getCellType(cell, game.snake, game.food);

            return (
              <div
                key={`${cell.x}-${cell.y}`}
                className={`border border-white/[0.03] ${
                  cellType === "head"
                    ? "bg-red-500"
                    : cellType === "body"
                      ? "bg-red-500/75"
                      : cellType === "food"
                        ? "bg-white"
                        : "bg-transparent"
                }`}
              />
            );
          })}
        </div>

        <div className="flex w-full flex-col gap-4 lg:max-w-xs">
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button
              type="button"
              onClick={() => handleDirectionPress("UP")}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            >
              Up
            </button>
            <div />

            <button
              type="button"
              onClick={() => handleDirectionPress("LEFT")}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => handleDirectionPress("DOWN")}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => handleDirectionPress("RIGHT")}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            >
              Right
            </button>
          </div>

          <button
            type="button"
            onClick={handlePause}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm"
          >
            {game.status === "running" ? "Pause" : "Start / Resume"}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="rounded-2xl border border-red-500/60 bg-red-500/15 px-4 py-3 text-sm"
          >
            Restart
          </button>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
            <p>Boundaries are lethal, and you cannot reverse into yourself.</p>
            <p className="mt-2">
              {game.status === "game-over"
                ? "Press restart or hit Enter to play again."
                : "Eat food to grow and keep the run going."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
