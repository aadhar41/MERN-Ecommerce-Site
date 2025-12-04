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
        const queryCopy = { ...this.queryStr }

        // Remove fields from the query
        const removeFields = ["keyword", "page", "limit", "category", "sortBy"];
        removeFields.forEach((key) => delete queryCopy[key]);

        // Add filter for category
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(",\"category\":\"", "$")
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