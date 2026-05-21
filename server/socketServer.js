const { Server } = require("socket.io");
const { resolveMove, resolveTurn } = require("./battle/turnResolver");

const TEAM_SIZE = 3;

const queue = [];
const rooms = new Map();

function getCreatureMoves(creature) {
  return creature.moves?.map((item) => item.move) || [];
}

function createTeamMember(creature) {
  return {
    creature,
    currentHp: creature.hp,
    modifiers: { atk: 1, def: 1, spd: 1 },
    fainted: false
  };
}

function validateTeam(team) {
  if (!Array.isArray(team) || team.length !== TEAM_SIZE) {
    return false;
  }

  const ids = new Set(team.map((creature) => creature?.id));

  if (ids.size !== TEAM_SIZE) {
    return false;
  }

  return team.every((creature) => {
    const moves = getCreatureMoves(creature);

    return (
      creature?.name &&
      Number.isInteger(creature.hp) &&
      Number.isInteger(creature.atk) &&
      Number.isInteger(creature.def) &&
      Number.isInteger(creature.spd) &&
      moves.length > 0
    );
  });
}

function createBattlePlayer(member, id, name) {
  return {
    id,
    name,
    currentHp: member.currentHp,
    modifiers: member.modifiers,
    creature: member.creature
  };
}

function updateTeamMember(member, battlePlayer) {
  return {
    ...member,
    currentHp: battlePlayer.currentHp,
    modifiers: battlePlayer.modifiers || { atk: 1, def: 1, spd: 1 },
    fainted: battlePlayer.currentHp <= 0
  };
}

function getFirstAvailableIndex(team) {
  return team.findIndex((member) => !member.fainted);
}

function isTeamDefeated(team) {
  return team.every((member) => member.fainted);
}

function getPlayerKey(room, socketId) {
  if (room.player1.socketId === socketId) return "player1";
  if (room.player2.socketId === socketId) return "player2";
  return null;
}

function otherKey(playerKey) {
  return playerKey === "player1" ? "player2" : "player1";
}

function getActiveMember(room, playerKey) {
  return room[playerKey].team[room[playerKey].activeIndex];
}

function findMove(member, moveName) {
  return getCreatureMoves(member.creature).find((move) => move.name === moveName);
}

function hasForcedSwitch(room, playerKey) {
  const activeMember = getActiveMember(room, playerKey);
  return activeMember?.fainted && !isTeamDefeated(room[playerKey].team);
}

function switchAction(player, member) {
  return {
    action: "switch",
    player: player.username,
    creature: member.creature.name,
    hit: true
  };
}

function serializeForPlayer(room, playerKey) {
  const opponentKey = otherKey(playerKey);

  return {
    roomId: room.id,
    playerKey,
    status: room.status,
    winner: room.winner,
    turnNumber: room.turnNumber,
    playerTeam: room[playerKey].team,
    opponentActive: getActiveMember(room, opponentKey),
    opponentName: room[opponentKey].username,
    activePlayerIndex: room[playerKey].activeIndex,
    activeOpponentIndex: room[opponentKey].activeIndex,
    logs: room.logs,
    waitingForOpponent: Boolean(room.submittedActions[playerKey]),
    playerMustSwitch: hasForcedSwitch(room, playerKey)
  };
}

function emitRoom(io, room, eventName = "battleUpdate") {
  io.to(room.player1.socketId).emit(eventName, serializeForPlayer(room, "player1"));
  io.to(room.player2.socketId).emit(eventName, serializeForPlayer(room, "player2"));
}

function createRoom(io, first, second) {
  const roomId = `battle-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const room = {
    id: roomId,
    player1: {
      socketId: first.socketId,
      username: first.username,
      team: first.team.map(createTeamMember),
      activeIndex: 0
    },
    player2: {
      socketId: second.socketId,
      username: second.username,
      team: second.team.map(createTeamMember),
      activeIndex: 0
    },
    submittedActions: {},
    logs: [],
    turnNumber: 1,
    status: "active",
    winner: null
  };

  rooms.set(roomId, room);
  io.sockets.sockets.get(first.socketId)?.join(roomId);
  io.sockets.sockets.get(second.socketId)?.join(roomId);
  emitRoom(io, room, "matchFound");
}

function updateWinner(room) {
  if (isTeamDefeated(room.player1.team)) {
    room.status = "finished";
    room.winner = room.player2.username;
    return;
  }

  if (isTeamDefeated(room.player2.team)) {
    room.status = "finished";
    room.winner = room.player1.username;
  }
}

function addFaintMessages(room, messages) {
  for (const playerKey of ["player1", "player2"]) {
    if (hasForcedSwitch(room, playerKey)) {
      const member = getActiveMember(room, playerKey);
      messages.push(`${member.creature.name} fainted. Waiting for switch.`);
    }
  }
}

function resolveMoveTurn(room, action1, action2) {
  const player1 = createBattlePlayer(
    getActiveMember(room, "player1"),
    1,
    room.player1.username
  );
  const player2 = createBattlePlayer(
    getActiveMember(room, "player2"),
    2,
    room.player2.username
  );
  const result = resolveTurn(player1, player2, action1.move, action2.move);

  room.player1.team[room.player1.activeIndex] = updateTeamMember(
    room.player1.team[room.player1.activeIndex],
    result.player1
  );
  room.player2.team[room.player2.activeIndex] = updateTeamMember(
    room.player2.team[room.player2.activeIndex],
    result.player2
  );

  return result.logs;
}

function resolveSwitchMoveTurn(room, switchKey, moveKey, switchActionData, moveActionData) {
  const movingPlayer = room[moveKey];
  const switchingPlayer = room[switchKey];

  switchingPlayer.activeIndex = switchActionData.index;

  const attacker = createBattlePlayer(
    getActiveMember(room, moveKey),
    moveKey === "player1" ? 1 : 2,
    movingPlayer.username
  );
  const defender = createBattlePlayer(
    getActiveMember(room, switchKey),
    switchKey === "player1" ? 1 : 2,
    switchingPlayer.username
  );
  const attackResult = resolveMove(attacker, defender, moveActionData.move);

  room[moveKey].team[room[moveKey].activeIndex] = updateTeamMember(
    room[moveKey].team[room[moveKey].activeIndex],
    attacker
  );
  room[switchKey].team[room[switchKey].activeIndex] = updateTeamMember(
    room[switchKey].team[room[switchKey].activeIndex],
    defender
  );

  return [switchAction(switchingPlayer, getActiveMember(room, switchKey)), attackResult];
}

function resolveSubmittedActions(io, room) {
  const action1 = room.submittedActions.player1;
  const action2 = room.submittedActions.player2;

  if (!action1 || !action2) {
    return;
  }

  const messages = [];
  let actions = [];

  if (action1.type === "switch" && action2.type === "switch") {
    room.player1.activeIndex = action1.index;
    room.player2.activeIndex = action2.index;
    actions = [
      switchAction(room.player1, getActiveMember(room, "player1")),
      switchAction(room.player2, getActiveMember(room, "player2"))
    ];
  } else if (action1.type === "switch") {
    actions = resolveSwitchMoveTurn(room, "player1", "player2", action1, action2);
  } else if (action2.type === "switch") {
    actions = resolveSwitchMoveTurn(room, "player2", "player1", action2, action1);
  } else {
    actions = resolveMoveTurn(room, action1, action2);
  }

  updateWinner(room);
  addFaintMessages(room, messages);

  if (room.status === "finished") {
    messages.push(`${room.winner} wins the battle!`);
  }

  room.logs.push({
    turnNumber: room.turnNumber,
    actions,
    messages
  });
  room.turnNumber += 1;
  room.submittedActions = {};

  emitRoom(io, room);
}

function handleForcedSwitch(io, room, playerKey, index) {
  room[playerKey].activeIndex = index;
  room.submittedActions = {};
  room.logs.push({
    message: `${room[playerKey].username} switched to ${getActiveMember(room, playerKey).creature.name}.`
  });
  emitRoom(io, room);
}

function setupSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173"
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinQueue", ({ team, username }) => {
      if (!validateTeam(team)) {
        socket.emit("battleError", "Select exactly 3 valid creatures before queueing.");
        return;
      }

      const existingQueueIndex = queue.findIndex(
        (entry) => entry.socketId === socket.id
      );

      if (existingQueueIndex >= 0) {
        queue.splice(existingQueueIndex, 1);
      }

      queue.push({
        socketId: socket.id,
        username: username || "Player",
        team
      });

      socket.emit("battleUpdate", { queueStatus: "Searching for match..." });

      if (queue.length >= 2) {
        const first = queue.shift();
        const second = queue.shift();
        createRoom(io, first, second);
      }
    });

    socket.on("leaveQueue", () => {
      const index = queue.findIndex((entry) => entry.socketId === socket.id);

      if (index >= 0) {
        queue.splice(index, 1);
      }

      socket.emit("battleUpdate", { queueStatus: "Queue cancelled." });
    });

    socket.on("submitMove", ({ roomId, moveName }) => {
      const room = rooms.get(roomId);

      if (!room || room.status === "finished") {
        socket.emit("battleError", "Battle is not active.");
        return;
      }

      const playerKey = getPlayerKey(room, socket.id);

      if (!playerKey) {
        socket.emit("battleError", "You are not in this battle.");
        return;
      }

      if (hasForcedSwitch(room, "player1") || hasForcedSwitch(room, "player2")) {
        socket.emit("battleError", "A fainted creature must be switched first.");
        return;
      }

      if (room.submittedActions[playerKey]) {
        socket.emit("battleError", "Action already submitted.");
        return;
      }

      const move = findMove(getActiveMember(room, playerKey), moveName);

      if (!move) {
        socket.emit("battleError", "Move is not available.");
        return;
      }

      room.submittedActions[playerKey] = {
        type: "move",
        move
      };

      socket.emit("battleUpdate", serializeForPlayer(room, playerKey));
      resolveSubmittedActions(io, room);
    });

    socket.on("submitSwitch", ({ roomId, index }) => {
      const room = rooms.get(roomId);

      if (!room || room.status === "finished") {
        socket.emit("battleError", "Battle is not active.");
        return;
      }

      const playerKey = getPlayerKey(room, socket.id);

      if (!playerKey) {
        socket.emit("battleError", "You are not in this battle.");
        return;
      }

      const member = room[playerKey].team[index];

      if (!member || member.fainted || index === room[playerKey].activeIndex) {
        socket.emit("battleError", "Switch target is invalid.");
        return;
      }

      if (hasForcedSwitch(room, playerKey)) {
        handleForcedSwitch(io, room, playerKey, index);
        return;
      }

      if (hasForcedSwitch(room, otherKey(playerKey))) {
        socket.emit("battleError", "Waiting for opponent to switch.");
        return;
      }

      if (room.submittedActions[playerKey]) {
        socket.emit("battleError", "Action already submitted.");
        return;
      }

      room.submittedActions[playerKey] = {
        type: "switch",
        index
      };

      socket.emit("battleUpdate", serializeForPlayer(room, playerKey));
      resolveSubmittedActions(io, room);
    });

    socket.on("disconnect", () => {
      const queueIndex = queue.findIndex((entry) => entry.socketId === socket.id);

      if (queueIndex >= 0) {
        queue.splice(queueIndex, 1);
      }

      for (const room of rooms.values()) {
        const playerKey = getPlayerKey(room, socket.id);

        if (playerKey && room.status !== "finished") {
          room.status = "finished";
          room.winner = room[otherKey(playerKey)].username;
          room.logs.push({
            message: `${room[playerKey].username} disconnected. ${room.winner} wins.`
          });
          emitRoom(io, room);
        }
      }
    });
  });
}

module.exports = setupSocketServer;
