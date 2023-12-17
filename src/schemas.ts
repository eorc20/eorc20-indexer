import { Type, Static } from "@sinclair/typebox";

export const TokensPayload = Type.Object({
    address: Type.Optional(Type.String()),
    page: Type.Optional(Type.Number()),
    pageSize: Type.Optional(Type.Number()),
    tick: Type.Optional(Type.String()),
})

export type TokensPayload = Static<typeof TokensPayload>