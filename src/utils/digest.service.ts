import type { IRootScopeService, ITimeoutService } from "angular";
import angular from "angular";

export class DigestService {
  constructor(
    private $timeout: ITimeoutService,
    private $rootScope: IRootScopeService,
  ) {}

  runOutsideDigest(fn: () => void = angular.noop) {
    this.$timeout(fn, 0, false);
  }

  runInsideDigest(fn: () => void = angular.noop) {
    this.$rootScope.$evalAsync(fn);
  }

  static get $name() {
    return "ngb.digest.service";
  }

  static get $inject() {
    return ["$timeout", "$rootScope"];
  }
}
