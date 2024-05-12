export const successRes = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  const responseData = {
    status: 1,
    rc: statusCode,
    message: message,
    data: data
  };

  res.json(responseData);
  return res.end();
};

export const errorRes = (res, data, message = "Internal Server Error", statusCode = 500) => {
  const responseData = {
    status: 0,
    rc: statusCode,
    message: message,
  };

  if (data !== undefined && data !== null && data.length > 0 && data !== "") {
    responseData.data = data;
  }

  res.json(responseData);
  return res.end();
};
