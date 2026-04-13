# ERD

## Users
- id (PK)
- username (unique)
- passwordHash
- createdAt

## Creatures
- id (PK)
- name
- type
- hp
- atk
- def
- spd

## Moves
- id (PK)
- name
- type
- power (nullable)
- accuracy
- effect (nullable)

## CreatureMoves
- id (PK)
- creatureId (FK)
- moveId (FK)

## Teams
- id (PK)
- userId (FK)
- name

## TeamCreatures
- id (PK)
- teamId (FK)
- creatureId (FK)
- slot (1-3)
- currentHp
- atkModifier
- defModifier
- spdModifier

## Battles
- id (PK)
- player1Id (FK)
- player2Id (FK)
- status
- winnerId (nullable)
- createdAt

## BattleTurns
- id (PK)
- battleId (FK)
- turnNumber
- actionData (JSON)

## Notes
- No abilities
- No special stats
- Each creature has one type
- Teams contain 3 creatures
- Battles are 1v1