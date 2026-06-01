import { toNativeElement } from "@ngb/utils";
import type { IDocumentService } from "angular";

export class NgbRTL {
	private _element!: HTMLElement;

	constructor($document: IDocumentService) {
		this._element = toNativeElement<Document>($document).documentElement;
	}

	isRTL() {
		const dir = this._element.getAttribute("dir") || "";
		return dir.toLowerCase() == "rtl";
	}

	static get $inject() {
		return ["$document"];
	}

	static get $name() {
		return "ngb.rtl.service";
	}
}
