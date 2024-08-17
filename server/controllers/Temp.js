// create temp controller

export const Temp = async (req, res) => {
  console.log(req.user.id);
  res.status(200).json({ message: "Welcome to the Battle Mania API" });
};

export default Temp;
