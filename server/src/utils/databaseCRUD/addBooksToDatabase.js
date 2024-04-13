import { Book } from "../../models/book.models.js";

const addBooksToDatabase = async (books) => {
  if (books) {
    try {
      const existingBooks = await Book.find({
        title: { $in: books.map((book) => book.title) },
      });
      const newBooks = books.filter(
        (book) =>
          !existingBooks.some(
            (existingBook) => book.title === existingBook.title
          )
      );

      if (newBooks.length > 0) {
        await Book.insertMany(newBooks);
        console.log(`${newBooks.length} books added to database successfully`);
      } else {
        console.log("No new books to add to database");
      }
    } catch (error) {
      console.log("Error while adding new books to database: ", error);
    }
  }
};

export { addBooksToDatabase };
