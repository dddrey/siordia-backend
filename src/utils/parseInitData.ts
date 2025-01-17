import { parse } from "@telegram-apps/init-data-node";

export const parseInitData = (initData: string) => {
  return parse(initData);
};
