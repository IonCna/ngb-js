import {type IAugmentedJQuery, type IComponentController, type IComponentOptions} from "angular";
import {ContentChild} from "ngjs-core";
import {NgbPaginationEllipsis} from "@ngb/pagination/ngb-pagination-ellipsis.directive.ts";
import {NgbPaginationFirst} from "@ngb/pagination/ngb-pagination-first.directive.ts";
import {NgbPaginationLast} from "@ngb/pagination/ngb-pagination-last.directive.ts";
import {NgbPaginationNext} from "@ngb/pagination/ngb-pagination-next.directive.ts";
import {NgbPaginationNumber} from "@ngb/pagination/ngb-pagination-number.directive.ts";
import {NgbPaginationPrevious} from "@ngb/pagination/ngb-pagination-previous.directive.ts";
import {NgbPaginationPages} from "@ngb/pagination/ngb-pagination-pages.directive.ts";
import {getValueInRange, isNumber} from "@ngb/utils";

import template from "@ngb/pagination/ngb-pagination.component.html"
import {NgbPaginationConfig} from "@ngb/pagination/ngb-pagination-config.service.ts";

export class NgbPagination implements IComponentController {
    public pageCount = 0
    public pages: number[] = []

    disabled!: boolean
    boundaryLinks?: unknown
    directionLinks?: unknown
    ellipses?: unknown
    rotate?: unknown
    maxSize!: number
    size?: unknown
    pageSize!: number

    page!: number
    collectionSize!: number

    pageChange?: (_: { $event: number }) => void

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

    constructor(
        private $element: IAugmentedJQuery,
        private _config: NgbPaginationConfig
    ) {}

    $onInit() {
        this.disabled = this.disabled ?? this._config.disabled;
        this.boundaryLinks = this.boundaryLinks ?? this._config.boundaryLinks;
        this.directionLinks = this.directionLinks ?? this._config.directionLinks;
        this.ellipses = this.ellipses ?? this._config.ellipses;
        this.rotate = this.rotate ?? this._config.rotate;
        this.maxSize = this.maxSize ?? this._config.maxSize;
        this.pageSize = this.pageSize ?? this._config.pageSize;
        this.page = this.page ?? 1
        this.size = this.size ?? this._config.size;

        this._updatePages(this.page);
    }

    $postLink() {
        this.$element.attr("role", "navigation")
    }
    
    hasPrevious() {
        return this.page > 1
    }

    hasNext(): boolean {
        return this.page < this.pageCount;
    }

    nextDisabled(): boolean {
        return !this.hasNext() || this.disabled;
    }

    previousDisabled(): boolean {
        return !this.hasPrevious() || this.disabled;
    }

    selectPage(pageNumber: number): void {
        this._updatePages(pageNumber);
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
            this.pageChange?.({
                $event: this.page
            });
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

    static get $name() {
        return "ngbPagination";
    }

    static get $factory(): IComponentOptions {
        return {
            controller: NgbPagination,
            controllerAs: "$",
            template,
            require: {
                ngDisabled: "?ngDisabled"
            },
            bindings: {
                boundaryLinks: "<?",
                directionLinks: "<?",
                ellipses: "<?",
                rotate: "<?",
                collectionSize: "<",
                maxSize: "<?",
                page: "<?",
                pageSize: "<?",
                pageChange: "&?",
                size: "<?"
            }
        }
    }

    static get $inject() {
        return ["$element", NgbPaginationConfig.$name]
    }
}
