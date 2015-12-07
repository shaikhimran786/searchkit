const update = require("react-addons-update")
import {BoolMust} from "./QueryBuilders"
import * as _ from "lodash"

export class ImmutableQuery {
  index: any
  query: any
  static defaultQuery: any = {
	  filter: BoolMust([]),
    query: BoolMust([])
  }
  static defaultIndex:any = {
    filters:{},
    filtersArray:[]
  }
  constructor(query = ImmutableQuery.defaultQuery, index = ImmutableQuery.defaultIndex) {
    this.index = index
    this.query = query
  }

  hasFilters(){
    return !_.isEmpty(this.index.filters)
  }

  addQuery(query) {
    if (query) {
      return this.update({
        query: BoolMust({ $push: [query] })
      })
    }
    return this
  }

  addFilter(key, bool) {
    var newIndex = update(this.index,{
      filters:{
        $merge:{[key]:bool}
      },
      filtersArray:{
        $push:bool.bool.must || bool.bool.should
      }
    })

    return this.update({
      filter: BoolMust({ $push: [bool] })
    }, newIndex)

  }

  getFiltersArray(){
    return this.index.filtersArray || []
  }

  setAggs(aggs) {
    return this.update({ $merge: { aggs } })
  }

  getFilters(key = undefined) {
    if (!_.isArray(key)) {
      key = [key];
    }
    const filters = _.values(_.omit(this.index.filters || {}, key))
    return BoolMust(filters)
  }

  setSize(size: number) {
    return this.update({ $merge: { size } })
  }
  setFrom(from: number) {
    return this.update({ $merge: { from } })
  }

  update(updateDef, newIndex = this.index) {
    return new ImmutableQuery(
      update(this.query, updateDef),
      newIndex
    )
  }

  static areQueriesDifferent(queryA: ImmutableQuery, queryB: ImmutableQuery) {
    if (!queryA || !queryB) {
      return true
    }

    return !_.isEqual(queryA.getJSON(), queryB.getJSON())
  }

  getJSON() {
    const replacer = (key, value) => {
      if (/^\$/.test(key)) {
        return undefined
      } else {
        return value
      }
    }
    return JSON.parse(JSON.stringify(this.query, replacer))
  }
}
