class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword
            ? {
                name: {
                    $regex: this.queryStr.keyword,
                    $options: "i",
                },
            }
            : {};
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryObj = { ...this.queryStr };

        // Exclude fields that are handled by other methods
        const excludedFields = ["keyword", "page", "limit", "sortBy", "select", "limitFields"];
        excludedFields.forEach((el) => delete queryObj[el]);

        // Advanced filtering for operators like gt, gte, lt, lte, in
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);
        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }

    sort() {
        const sortBy = this.queryStr.sortBy || "createdAt:desc";
        this.query = this.query.sort(sortBy);
        return this;
    }

    select() {
        const selectFields = this.queryStr.select || "";
        this.query = this.query.select(selectFields);
        return this;
    }

    count() {
        this.query = this.query.count();
        return this;
    }

    limitFields() {
        const limitFields = this.queryStr.limitFields || "";
        this.query = this.query.select(limitFields);
        return this;
    }


}

module.exports = APIFeatures;