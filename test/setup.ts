import "./test-framework-shim";
import angular from "angular";
import "angular-mocks";

globalThis.angular = angular;

if (typeof window !== "undefined") {
  window.angular = angular;
}
