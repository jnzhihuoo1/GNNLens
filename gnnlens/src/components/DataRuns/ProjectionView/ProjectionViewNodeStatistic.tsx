import * as React from "react";
import { Tag } from 'antd';
import {getNodeStatisticStr} from '../../../helper';
export interface IProps {
    ProjectionViewSelectedNodes: number,
    ProjectionViewTotalNodeNum: number
}
export interface IState {
}
export default class ProjectionViewNodeStatistic extends React.Component<IProps, IState>{
    public render() {
        return <Tag> {getNodeStatisticStr(this.props.ProjectionViewSelectedNodes, this.props.ProjectionViewTotalNodeNum)}</Tag>
    }
}

