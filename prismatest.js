import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

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
        rating: parseFloat(reviewData.rating),
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

async function loginNewUser(userData){
  const newUser = await prisma.beerAppUser.create({
    data: {
      user_name : userData.name,
      user_password: userData.password
    }
  });
  return newUser;
}

async function searchUser(userName){
  const result = await prisma.beerAppUser.findFirst({
    where: {
      user_name: userName
    }
  });
  return result;
}

async function searchUserId(userName){
  const result = await prisma.beerAppUser.findFirst({
    where:{
      user_name : userName
    }
  });
  return result;
}

async function searchLatestEntries(){
  const result = await prisma.beerReviews.findMany({
    take: 5,
    orderBy:{
      created_at: 'desc'
    }
  });
  return result;
}

async function groupByBreweryAndName(){
  const result = await prisma.beerReviewData.groupBy({
    by: ['brewery','beerName'],
    _avg: {
      rating: true
    }
  });
  return result;
}

async function updateRow(param, data){
  switch (param){
    case 'picture':
      const resultPicture = await prisma.beerReviews.update({
        where: {
          review_id: data.review_id
        },
        data:{
          picture_url: data.picture_url
        }
      })
      return resultPicture;
    case 'data':
      const resultData = await prisma.beerReviews.update({
        where: {
          review_id: data.review_id
        },
        data: {
        rating: parseFloat(data.rating),
        longReview: data.longReview,
        beerName: data.beerName,
        shortReview: data.shortReview,
        category: data.category,
        brewery: data.brewery
        }
      })
      return resultData;
  }
    
}

async function deleteRow(reviewId){
  const result = await prisma.beerReviews.delete({
    where: {
      review_id: reviewId
    }
  })
  return result;
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

export async function createNewUser(userData){
  let result = null;
  try {
    result = await loginNewUser(userData);
    await prisma.$disconnect();
    return result;
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
}

export async function checkIfUserNameExists(userName){
  try {
    const result = await searchUser(userName);
    await prisma.$disconnect();
    return (result === null);
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
}

export async function getUserPassword(userName){
  try {
    const userData = await searchUser(userName);
    await prisma.$disconnect();
    return userData.user_password;
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
}

export async function getUserId(userName){
  try {
    const userId = await searchUserId(userName);
    await prisma.$disconnect();
    return userId;
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
}

export async function getLatestEntries(){
  try {
    const latestEntries = await searchLatestEntries();
    await prisma.$disconnect();
    return latestEntries;
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
}

export async function getCalculatedAverage(){
  try {
    const latestEntries = await groupByBreweryAndName();
    await prisma.$disconnect();
    return latestEntries;
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
}

export async function deleteReview(reviewId){
  try {
    const update = await deleteRow(reviewId);
    await prisma.$disconnect();
    return update;
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
}

export async function updateReview(param, data){
  try {
    const update = await updateRow(param, data);
    await prisma.$disconnect();
    return update;
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
}
