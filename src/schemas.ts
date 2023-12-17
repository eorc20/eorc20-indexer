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
    number: Type.Number({example: 22126343}),
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

export const InscriptionPayload = Type.Object({
    owner: Type.Optional(Type.String({example: "0x0fb3e4662065c27bac8fbdfb8f1731c3293fdc09"})),
    page: Type.Optional(Type.Number({example: 1})),
    pageSize: Type.Optional(Type.Number({example: 12})),
    tick: Type.Optional(Type.String({example: "eoss"})),
})

export type InscriptionPayload = Static<typeof InscriptionPayload>

export const InscriptionArrayItem = Type.Object({
    id: Type.String({example: "0x8c3adec69b79c036a21e7ccddf2ef387ef6ecde6a9bd7ef1b3d40c3fe1d399b1"}),
    number: Type.Number({example: 1032}),
    owner: Type.String({example: "0x50e6585875ad67ffa6bd44381d7a572bdbdfa0ae"}),
    block: Type.Number({example: 21443083}),
    timestamp: Type.Number({example: 1702104171}),
    protocol: Type.String({example: "eorc-20"}),
    contentType: Type.String({example: "text/plain"}),
    content: Type.String({example: "data:,{\"p\":\"eorc20\",\"op\":\"mint\",\"tick\":\"eoss\",\"amt\":\"10000\"}"}),
})

export const InscriptionResponse = Type.Object({
    status: Type.Number({example: 200}),
    data: Type.Array(InscriptionArrayItem),
})

export type InscriptionResponse = Static<typeof InscriptionResponse>

