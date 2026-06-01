import type { IAugmentedJQuery, ICompileService, IController, IDirective, IPromise, IScope } from "angular";
import angular from "angular";
import { NgbAnimationFactory } from "@/ngb-animation.factory";
import { NgbNav } from "./ngb-nav.directive";
import { NgbNavChangeOutletEvent } from "./ngb-nav.events";
import { navMap } from "./ngb-nav.module";

export class NgbNavOutlet implements IController {
  private nav?: NgbNav;
  private isChanging: boolean = false;
  private outletWatcher?: () => void;
  private activeScope?: IScope;
  private activePane?: JQLite;
  private activeId?: any;
  private ngbTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>;
  private queuedId?: any;

  constructor(
    private $element: JQLite,
    private $compile: ICompileService,
    private ngbAnimationFactory: NgbAnimationFactory,
  ) {}

  $postLink(): void {
    this.$element.addClass("tab-content mt-2");
    this.ngbTransition = this.ngbAnimationFactory.$create();

    const navHost = this.resolveNavHost();
    if (navHost) {
      this.nav = angular.element(navHost).controller(NgbNav.$name) as NgbNav;
    }
    if (!this.nav) return;

    const nav = navMap.get(this.nav);
    if (!nav) return;

    this.outletWatcher = nav.scope.$on(NgbNavChangeOutletEvent, (event, nextId) => {
      event.stopPropagation?.();
      event.preventDefault();
      void this.render(nextId);
    });

    void this.render(nav.config.activeId);
  }

  $onDestroy(): void {
    this.outletWatcher?.();
    this.activeScope?.$destroy();
  }

  private async render(id?: any) {
    if (this.isChanging) {
      this.queuedId = id;
      return;
    }
    if (!this.nav) return;

    const nav = navMap.get(this.nav);
    if (!nav) return;

    const targetId = id ?? nav.config.activeId;
    if (targetId === this.activeId) return;

    const target = nav.contents.get(targetId);
    if (!target) return;

    this.isChanging = true;

    const previousPane = this.activePane;
    const previousScope = this.activeScope;

    if (previousPane) {
      await this.hide(previousPane, !!nav.config.animation);
      previousPane.remove();
      nav.events.hidden?.();
    }

    previousScope?.$destroy();
    this.activeScope = undefined;
    this.activePane = undefined;

    this.$element.empty();

    const pane = angular.element("<div ngb-nav-pane></div>");
    pane.addClass("tab-pane");

    const { transcludeFn } = target;
    transcludeFn((clone, scope) => {
      if (!clone || !scope) return;

      const linkFn = this.$compile(pane);
      const compiled = linkFn(scope);
      compiled.append(clone);

      this.$element.append(compiled);
      this.activePane = compiled;
      this.activeScope = scope;
      this.activeId = targetId;
    }, pane);

    if (this.activePane) {
      await this.show(this.activePane, !!nav.config.animation);
      nav.events.shown?.();
    }

    this.isChanging = false;
    if (this.queuedId !== undefined) {
      const queuedId = this.queuedId;
      this.queuedId = undefined;
      void this.render(queuedId);
    }
  }

  private async show(pane: JQLite, animation: boolean) {
    pane.addClass("fade");
    pane.removeClass("show active");

    if (!animation) {
      pane.addClass("show active");
      return;
    }

    await this.ngbTransition?.(pane, () => {
      pane.addClass("show active");
    });
  }

  private async hide(pane: JQLite, animation: boolean) {
    pane.addClass("fade");

    if (!animation) {
      pane.removeClass("show active");
      return;
    }

    await this.ngbTransition?.(pane, () => {
      pane.removeClass("show active");
    });
  }

  private resolveNavHost(): Element | null {
    const parent = this.$element.parent()?.[0] as HTMLElement | undefined;
    if (!parent) return null;

    const children = Array.from(parent.children);
    const self = this.$element[0];
    const selfIndex = children.indexOf(self);
    if (selfIndex < 0) return parent.querySelector("[ngb-nav]");

    for (let i = selfIndex - 1; i >= 0; i--) {
      const candidate = children[i];
      if (candidate.hasAttribute("ngb-nav")) return candidate;
    }

    return parent.querySelector("[ngb-nav]");
  }

  //#region $angular

  static get $name() {
    return "ngbNavOutlet";
  }

  static get $inject() {
    return ["$element", "$compile", NgbAnimationFactory.$name];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavOutlet,
      bindToController: true,
      restrict: "A",
      scope: true,
    });
  }

  //#endregion
}
