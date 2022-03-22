import { ROOT_VIEW } from "../../views";

export const getRoot = (_req, res) => {
  res.send(ROOT_VIEW);
};
