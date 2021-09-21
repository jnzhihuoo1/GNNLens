import * as React from "react";
import { Tag } from 'antd';
import {getNodeStatisticStr} from '../../../helper';
export interface IProps {
    PSSelectedNodes: number,
    totalNodeNum: number
}
export interface IState {
}
export default class PSViewNodeStatistic extends React.Component<IProps, IState>{
    public render() {
        return <Tag> {getNodeStatisticStr(this.props.PSSelectedNodes, this.props.totalNodeNum)}</Tag>
    }
}

