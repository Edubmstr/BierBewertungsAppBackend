import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

/*async function main() {
    const allReviews = await prisma.beerReviewData.findMany();
    //console.log(allReviews);
    return allReviews;
}*/

 async function getAllReviewData() {
    const allReviews = await prisma.beerReviewData.findMany();
    return allReviews;
}

async function getSingleReviewData(reviewId) {
    const singleReview = await prisma.beerReviewData.findUnique({
        where : {
            review_id: reviewId
        }
    });
    return singleReview;
}

async function getUserReviewData(userId){
    const userReviews = await prisma.beerReviewData.findMany({
      where: {
        user_id: userId
      }
    });
    return userReviews;
}

async function createNewReviewFunc(reviewData) {
    const newReview = await prisma.beerReviews.create({
      data: {
        created_by_user_id: reviewData.userId,
        rating: reviewData.rating,
        longReview: reviewData.longReview,
        beerName: reviewData.beerName,
        shortReview: reviewData.shortReview,
        category: reviewData.category,
        brewery: reviewData.brewery,
        picture_url: reviewData.pictureUrl,
      }
    });
    return newReview;
}


export async function getAllReviews() {
    let result = null;
    try {
       result = await getAllReviewData();
       await prisma.$disconnect();
       return result;
    } catch (error) {
        console.error(error)
        await prisma.$disconnect()
        process.exit(1)
    }
}

export async function getSingleReviews(reviewId) {
    let result = null;
    try {
       result = await getSingleReviewData(reviewId);
       await prisma.$disconnect();
       return result;
    } catch (error) {
        console.error(error)
        await prisma.$disconnect()
        process.exit(1)
    }
}

export async function getUserReviews(userId) {
  let result = null;
  try {
     result = await getUserReviewData(userId);
     await prisma.$disconnect();
     return result;
  } catch (error) {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
  }
}

export async function createNewReview(oBody){
  let result = null;
  try {
     result = await createNewReviewFunc(oBody);
     await prisma.$disconnect();
     return result;
  } catch (error) {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
  }
}
/*main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

  let result = null;*/

  /*try {
    result = await getAllReviewData();
    await prisma.$disconnect()
  } catch (e) {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }
  
  console.log(result);*/
