import ApiError from "./ApiError.js";

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

// // This is a higher order function (a function that takes another function as an argument)
// const asyncHandler = (requestHandler) => async (req, res, next) => {
//   try {
//     await requestHandler(req, res, next);
//   } catch (error) {
//     return new ApiError(error.statusCode, error.message, error.errors);
//   }
// }

export { asyncHandler };
