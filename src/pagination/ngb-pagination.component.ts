import { Component, ContentChild, EventEmitter, HostBinding, inject, Input, type OnChanges, Output, type SimpleChanges } from "ngjs-core";
import {NgbPaginationEllipsis} from "@ngb/pagination/ngb-pagination-ellipsis.directive";
import {NgbPaginationFirst} from "@ngb/pagination/ngb-pagination-first.directive";
import {NgbPaginationLast} from "@ngb/pagination/ngb-pagination-last.directive";
import {NgbPaginationNext} from "@ngb/pagination/ngb-pagination-next.directive";
import {NgbPaginationNumber} from "@ngb/pagination/ngb-pagination-number.directive";
import {NgbPaginationPrevious} from "@ngb/pagination/ngb-pagination-previous.directive";
import {NgbPaginationPages} from "@ngb/pagination/ngb-pagination-pages.directive";
import {getValueInRange, isNumber} from "@ngb/utils";

import template from "@ngb/pagination/ngb-pagination.component.html"
import {NgbPaginationConfig} from "@ngb/pagination/ngb-pagination-config.service";

export interface NgbPaginationLinkContext {
    currentPage: number;
    disabled: boolean;
}

export interface NgbPaginationNumberContext extends NgbPaginationLinkContext {
    $implicit: number;
}

export interface NgbPaginationPagesContext {
    $implicit: number;
    disabled: boolean;
    pages: number[];
}

@Component({
    selector: "ngb-pagination",
    template,
})
export class NgbPagination implements OnChanges {
    private _config = inject(NgbPaginationConfig);

    public pageCount = 0
    public pages: number[] = []

    @ContentChild(NgbPaginationEllipsis, { static: false })
    tplEllipsis?: NgbPaginationEllipsis

    @ContentChild(NgbPaginationFirst, { static: false })
    tplFirst?: NgbPaginationFirst

    @ContentChild(NgbPaginationLast, { static: false })
    tplLast?: NgbPaginationLast

    @ContentChild(NgbPaginationNext, { static: false })
    tplNext?: NgbPaginationNext

    @ContentChild(NgbPaginationNumber, { static: false })
    tplNumber?: NgbPaginationNumber

    @ContentChild(NgbPaginationPrevious, { static: false })
    tplPrevious?: NgbPaginationPrevious

    @ContentChild(NgbPaginationPages, { static: false })
    tplPages?: NgbPaginationPages

    @Input() disabled = this._config.disabled;
    @Input() boundaryLinks = this._config.boundaryLinks;
    @Input() directionLinks = this._config.directionLinks;
    @Input() ellipses = this._config.ellipses;
    @Input() rotate = this._config.rotate;
    @Input({ required: true }) collectionSize!: number;
    @Input() maxSize = this._config.maxSize;
    @Input() page = 1;
    @Input() pageSize = this._config.pageSize;
    @Output() pageChange = new EventEmitter<number>();
    @Input() size = this._config.size;

    @HostBinding("attr.role") readonly _role = "navigation";

    isDisabled(): boolean {
        return this.disabled;
    }
    
    hasPrevious() {
        return this.page > 1
    }

    hasNext(): boolean {
        return this.page < this.pageCount;
    }

    nextDisabled(): boolean {
        return !this.hasNext() || this.isDisabled();
    }

    previousDisabled(): boolean {
        return !this.hasPrevious() || this.isDisabled();
    }

    selectPage(pageNumber: number): void {
        this._updatePages(pageNumber);
    }

    ngOnChanges(_changes: SimpleChanges): void {
        this._updatePages(this.page);
    }

    isEllipsis(pageNumber: number): boolean {
        return pageNumber === -1;
    }

    private _applyEllipses(start: number, end: number) {
        if(!this.ellipses) return

        if(start > 0) {
            if(start > 2) this.pages.unshift(-1)
            if(start === 2) this.pages.unshift(2)
            this.pages.unshift(1);
        }

        if(end < this.pageCount) {
            if (end < this.pageCount - 2) this.pages.push(-1)
            if (end === this.pageCount - 2) this.pages.push(this.pageCount - 1);
            this.pages.push(this.pageCount)
        }
    }

    private _applyRotation(): [number, number] {
        let start = 0
        let end = this.pageCount

        const leftOffset = Math.floor((this.maxSize / 2))
        const rightOffset = this.maxSize % 2 == 0 ? leftOffset - 1 : leftOffset

        if(this.page <= leftOffset) {
            end = this.maxSize
        } else if(this.pageCount - this.page < leftOffset) {
            start = this.pageCount - this.maxSize;
        } else {
            start = this.page - leftOffset - 1;
            end = this.page + rightOffset;
        }

        return [start, end]
    }

    private _applyPagination(): [number, number] {
        const page = Math.ceil(this.page / this.maxSize) - 1;
        const start = page * this.maxSize;
        const end = start + this.maxSize;

        return [start, end];
    }

    private _setPageInRange(newPageNo: number) {
        const prevPageNo = this.page
        this.page = getValueInRange(newPageNo, this.pageCount, 1)

        if(this.page != prevPageNo && isNumber(this.collectionSize)) {
            this.pageChange.emit(this.page);
        }
    }

    private _updatePages(newPage: number) {
        this.pageCount = Math.ceil(this.collectionSize / this.pageSize)

        if(!isNumber(this.pageCount)) {
            this.pageCount = 0
        }

        this.pages.length = 0

        for (let index = 1; index <= this.pageCount; index++) {
            this.pages.push(index)
        }

        this._setPageInRange(newPage)

        if(this.maxSize > 0 && this.pageCount > this.maxSize) {
            let start = 0;
            let end = this.pageCount;

            [start, end] = this.rotate ? this._applyRotation() : this._applyPagination()

            const visiblePages = this.pages.slice(start, end);
            this.pages.splice(0, this.pages.length, ...visiblePages);

            this._applyEllipses(start, end)
        }
    }
}
