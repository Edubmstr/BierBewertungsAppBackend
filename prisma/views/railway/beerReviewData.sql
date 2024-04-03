SELECT
  `railway`.`beerReviews`.`review_id` AS `review_id`,
  `railway`.`beerReviews`.`rating` AS `rating`,
  `railway`.`beerReviews`.`longReview` AS `longReview`,
  `railway`.`beerReviews`.`beerName` AS `beerName`,
  `railway`.`beerReviews`.`created_at` AS `created_at`,
  `railway`.`beerReviews`.`shortReview` AS `shortReview`,
  `railway`.`beerReviews`.`picture_url` AS `picture_url`,
  `railway`.`beerReviews`.`category` AS `category`,
  `railway`.`beerReviews`.`brewery` AS `brewery`,
  `railway`.`beerReviews`.`created_by_user_id` AS `created_by_user_id`,
  `railway`.`beerAppUser`.`user_id` AS `user_id`,
  `railway`.`beerAppUser`.`user_name` AS `user_name`
FROM
  (
    `railway`.`beerReviews`
    JOIN `railway`.`beerAppUser` ON(
      (
        `railway`.`beerReviews`.`created_by_user_id` = `railway`.`beerAppUser`.`user_id`
      )
    )
  )