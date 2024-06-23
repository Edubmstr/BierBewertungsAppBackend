SELECT
  `beerapp`.`beerReviews`.`review_id` AS `review_id`,
  `beerapp`.`beerReviews`.`rating` AS `rating`,
  `beerapp`.`beerReviews`.`longReview` AS `longReview`,
  `beerapp`.`beerReviews`.`beerName` AS `beerName`,
  `beerapp`.`beerReviews`.`created_at` AS `created_at`,
  `beerapp`.`beerReviews`.`changed_at` AS `changed_at`,
  `beerapp`.`beerReviews`.`shortReview` AS `shortReview`,
  `beerapp`.`beerReviews`.`picture_url` AS `picture_url`,
  `beerapp`.`beerReviews`.`category` AS `category`,
  `beerapp`.`beerReviews`.`brewery` AS `brewery`,
  `beerapp`.`beerReviews`.`created_by_user_id` AS `created_by_user_id`,
  `beerapp`.`beerAppUser`.`user_id` AS `user_id`,
  `beerapp`.`beerAppUser`.`user_name` AS `user_name`
FROM
  (
    `beerapp`.`beerReviews`
    JOIN `beerapp`.`beerAppUser` ON(
      (
        `beerapp`.`beerReviews`.`created_by_user_id` = `beerapp`.`beerAppUser`.`user_id`
      )
    )
  )