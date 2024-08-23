class APIFeatures {
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  filter() {
    const queryObj = { ...this.queryParams };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => { delete queryObj[el]; });

    /* A query like this: ?price[gte]=1497&a=13&b[lt]=5
    *  Stringified req.query: {"price":{"gte":"1497"},"a":"13","b":{"lt":"5"}}
    */
    let queryStr = JSON
      .stringify(queryObj)
      .replace(/\b(g|l)te?\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    this.query.sort(
      this.queryParams.sort ?
        this.queryParams.sort.replace(/,/g, ' ')
        : 'createdAt _id'
    );
    return this;
  }

  limitFields() {
    this.query = this.query.select(
      this.queryParams.fields ?
        this.queryParams.fields.replace(/,/g, ' ')
        : '-__v'
    );
    return this;
  }

  paginate() {
    let { page = 1, limit = 10 } = this.queryParams;
    page *= 1;
    limit *= 1;
    const skip = (page - 1) * limit;

    /* if (this.queryParams.page) {
      if (skip >= await Tour.countDocuments()) throw new Error('This page does not exist.');
    } */
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

}

module.exports = APIFeatures;