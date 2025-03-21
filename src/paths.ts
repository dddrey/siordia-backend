import * as path from "path";
import moduleAlias from "module-alias";

moduleAlias.addAliases({
  "@": path.join(__dirname, "/"),
});
