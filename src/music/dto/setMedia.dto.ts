import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class SetMediaDto {

    @IsNotEmpty({message: "L'identifiant de l'utilisateur ne doit pas être vide"})
    @IsNumber({}, {message: "L'identifiant de l'utilisateur doit être un nombre"})
    userId: number;

    @IsNotEmpty({message: "Le token d'accès ne doit pas être vide"})
    @IsString({message: "Le token d'accès doit être une chaîne de caractères"})
    tokenAccount: string;

    @IsOptional()
    @IsString({message: "Le nom du média doit être une chaîne de caractères"})
    mediaName?: string;
}