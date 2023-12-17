import { Type, Static } from "@sinclair/typebox";

export const TokensPayload = Type.Object({
    address: Type.Optional(Type.String({example: "0x0fb3e4662065c27bac8fbdfb8f1731c3293fdc09"})),
    page: Type.Optional(Type.Number({example: 1})),
    pageSize: Type.Optional(Type.Number({example: 12})),
    tick: Type.Optional(Type.String({example: "eoss"})),
})

export type TokensPayload = Static<typeof TokensPayload>

export const TokensListItem = Type.Object({
    amount: Type.String({example: "10000"}),
    tick: Type.String({example: "eoss"}),
    number: Type.String({example: "22126343"}),
    precision: Type.Number({example: 0}),
    createdAt: Type.Number({example: 1700888064}),
})

export type TokensListItem = Static<typeof TokensListItem>

export const TokensResponse = Type.Object({
    status: Type.Number({example: 200}),
    data: Type.Object({
        list: Type.Array(TokensListItem),
        count: Type.Number({example: 1}),
    }),
})

export type TokensResponse = Static<typeof TokensResponse>
