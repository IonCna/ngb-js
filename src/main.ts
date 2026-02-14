import angular, { type IController } from "angular"
import { NgbModule } from "@ngb"
import "node_modules/bootstrap/dist/css/bootstrap.css"

const app = angular.module("ngb.test", [NgbModule.name])

class AppController implements IController {
    private collapse = false

    get isCollapsed() {
        return this.collapse
    }

    set isCollapsed(value: boolean) {
        this.collapse = value
    }

    static get $name() {
        return "ngb.app"
    }
}

app.controller(AppController.$name, AppController)
