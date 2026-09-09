import { Service } from "ngjs-core";

@Service({ id: "ngb.pagination.config.service" })
export class NgbPaginationConfig {
  disabled = false;
  boundaryLinks = false;
  directionLinks = true;
  ellipses = true;
  maxSize = 0;
  pageSize = 10;
  rotate = false;
  size?: "sm" | "lg" | string | null;
}
