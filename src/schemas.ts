import { Type, Static } from "@sinclair/typebox";

export const InscriptionRawData = Type.Object({
    id: Type.String({example: "0x8c3adec69b79c036a21e7ccddf2ef387ef6ecde6a9bd7ef1b3d40c3fe1d399b1"}),
    block: Type.Number({example: 21443083}),
    timestamp: Type.Number({example: 1702104171}),
    from: Type.String({example: "0x50e6585875ad67ffa6bd44381d7a572bdbdfa0ae"}),
    to: Type.String({example: "0x50e6585875ad67ffa6bd44381d7a572bdbdfa0ae"}),
    contentType: Type.String({example: "text/plain"}),
    content: Type.String({example: "data:,{\"p\":\"eorc20\",\"op\":\"mint\",\"tick\":\"eoss\",\"amt\":\"10000\"}"}),
    value: Type.Optional(Type.String({example: "0"})),
})

export type InscriptionRawData = Static<typeof InscriptionRawData>