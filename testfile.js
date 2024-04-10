import { PrismaClient } from '@prisma/client';
import { checkIfUserNameExists } from './prismatest.js';

const prisma = new PrismaClient();

/*async function checkUser(){
    const result = await prisma.beerAppUser.findFirst({
        where: {
            user_name: "Admi",
        },
    });
    return result;
}

try {
    const result = await checkUser();
    if(result === null){
        console.log("User not found");
    }else{
        console.log("User found");
    }
} catch (error) {
    console.log();
}*/

console.log(await checkIfUserNameExists("Julia"));