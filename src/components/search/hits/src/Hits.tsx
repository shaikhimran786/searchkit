import * as React from "react";

import {
	SearchkitComponent,
	PageSizeAccessor,
	ImmutableQuery,
	HighlightAccessor,
	SearchkitComponentProps,
	ReactComponentType,
	PureRender,
	SourceFilterType,
	SourceFilterAccessor,
	HitsAccessor,
	RenderComponentType,
	RenderComponentPropType,
	renderComponent,
	block
} from "../../../../core"

const map = require("lodash/map")
const defaults = require("lodash/defaults")



export interface HitItemProps {
	key:string,
	bemBlocks?:any,
	result:Object
}

@PureRender
export class HitItem extends React.Component<HitItemProps, any> {

	render(){
		return (
			<div data-qa="hit" className={this.props.bemBlocks.item().mix(this.props.bemBlocks.container("item"))}>
			</div>
		)
	}
}

export interface HitsListProps{
	mod?:string,
	className?:string,
	itemComponent?:RenderComponentType<HitItemProps>,
	hits:Array<Object>
}

@PureRender
export class HitsList extends React.Component<HitsListProps, any>{

	static defaultProps={
		mod:"sk-hits"
	}

	static propTypes = {
		mod:React.PropTypes.string,
		className:React.PropTypes.string,
		itemComponent:RenderComponentPropType,
		hits:React.PropTypes.array
	}

	render(){
		const {hits, mod, className, itemComponent} = this.props
		const bemBlocks = {
			container: block(mod),
			item: block(`${mod}-hit`)
		}
		return (
			<div data-qa="hits" className={bemBlocks.container().mix(className)}>
				{map(hits, (result, index)=> {
					return renderComponent(itemComponent, {
						key:result._id, result, bemBlocks, index
					})
				})}
			</div>
		)
	}
}

export interface HitsProps extends SearchkitComponentProps{
	hitsPerPage: number
	highlightFields?:Array<string>
	sourceFilter?:SourceFilterType
	itemComponent?:ReactComponentType<HitItemProps>
	listComponent?:ReactComponentType<HitsListProps>
	scrollTo?: boolean|string,
	className?:string
}


export class Hits extends SearchkitComponent<HitsProps, any> {
	hitsAccessor:HitsAccessor

	static propTypes = defaults({
		hitsPerPage:React.PropTypes.number.isRequired,
		highlightFields:React.PropTypes.arrayOf(
			React.PropTypes.string
		),
		sourceFilterType:React.PropTypes.oneOf([
			React.PropTypes.string,
			React.PropTypes.arrayOf(React.PropTypes.string),
			React.PropTypes.bool
		]),
		itemComponent:RenderComponentPropType,
		listComponent:RenderComponentPropType,
		className:React.PropTypes.string
	}, SearchkitComponent.propTypes)

	static defaultProps = {
		itemComponent:HitItem,
		listComponent:HitsList,
		scrollTo: "body"
	}

	componentWillMount() {
		super.componentWillMount()
		if(this.props.highlightFields) {
			this.searchkit.addAccessor(
				new HighlightAccessor(this.props.highlightFields))
		}
		if(this.props.sourceFilter){
			this.searchkit.addAccessor(
				new SourceFilterAccessor(this.props.sourceFilter)
			)
		}
		this.hitsAccessor = new HitsAccessor({ scrollTo:this.props.scrollTo })
		this.searchkit.addAccessor(this.hitsAccessor)
	}

	defineAccessor(){
		return new PageSizeAccessor(this.props.hitsPerPage)
	}

	render() {
		let hits:Array<Object> = this.getHits()
		let hasHits = hits.length > 0

		if (!this.isInitialLoading() && hasHits) {
			return renderComponent(this.props.listComponent, {
				hits,
				mod:this.props.mod,
				className:this.props.className,
				itemComponent:this.props.itemComponent
			})
		}

		return null

	}
}
