import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
    const allReviews = await prisma.beerReviewData.findMany();
    //console.log(allReviews);
    return allReviews;
}

export async function getAllReviewData() {
    const allReviews = await prisma.beerReviewData.findMany();
    return allReviews;
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

  let result = null;

  /*try {
    result = await getAllReviewData();
    await prisma.$disconnect()
  } catch (e) {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }
  
  console.log(result);*/
