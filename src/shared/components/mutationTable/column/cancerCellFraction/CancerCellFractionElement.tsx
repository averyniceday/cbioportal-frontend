import * as React from 'react';
import DefaultTooltip from "public-lib/components/defaultTooltip/DefaultTooltip";
import SampleManager from "pages/patientView/SampleManager";

const maxBarHeight=12;
const barWidth = 6;
const barSpacing = 3;
const indexToBarLeft = (n:number) => n * (barWidth + barSpacing);

function getSVGWidth(numberOfSamples:number) {
    return numberOfSamples*barWidth + (numberOfSamples-1)*barSpacing
}

const CancerCellFractionElementTooltip: React.FunctionComponent<{
    sampleIds: string[],
    sampleToCCFValue: any,
    sampleManager?: SampleManager
}> = (props) => {
    const firstColumnStyle={
        width:40,
        display: 'inline-block'
    };
    return (
        <div>
            {props.sampleManager ? (
                <div>
                    {props.sampleManager.getComponentForSample(props.sampleIds[0], 1, "")}
                </div>
            ) : null}
            <div>
                <span style={firstColumnStyle}>CancerCellFraction</span>
            </div>
        </div>
    );
};

const CancerCellFractionBar: React.FunctionComponent<{
    ccfValue: string,
    color: string,
    barX: number
}> = (props) => {
    const barHeight = (isNaN(+props.ccfValue) ? 0 : +props.ccfValue)*maxBarHeight;
    const barY = maxBarHeight - barHeight;
    return (
        <rect x={props.barX} y={barY} width={barWidth} height={barHeight} fill={props.color}/>
    )
};




const CancerCellFractionBarGraph: React.FunctionComponent<{
    sampleIds: string[],
    sampleToCCFValue: { [key: string]: string },
    sampleManager?: SampleManager
}> = (props) => {
    const sampleOrder = props.sampleManager ? props.sampleManager.getSampleIdsInOrder() : [];
    const barX = sampleOrder.reduce((map, sampleId:string, i:number) => {map[sampleId] = indexToBarLeft(i); return map;}, {} as {[s:string]:number});
    
    return (
        <svg
            width={getSVGWidth(sampleOrder.length)}
            height={maxBarHeight}
        >
            {sampleOrder.map((sample:string)=>{
               return <CancerCellFractionBar 
                    ccfValue={props.sampleToCCFValue[sample]}
                    color={props.sampleManager ? props.sampleManager.getColorForSample(sample) : 'black'}
                    barX={barX[sample]}
               />
            })}
        </svg>
    )
};

const CancerCellFractionElement: React.FunctionComponent<{
    sampleIds: string[],
    sampleToCCFValue: { [key: string]: string },
    sampleManager?: SampleManager
}> = (props) => {
    if (props.sampleManager) {
        return (
            <DefaultTooltip
                placement="left"
                overlay={<CancerCellFractionElementTooltip {...props}/>}
            >
                <span>
                    {<CancerCellFractionBarGraph {...props}/>}
                </span>
            </DefaultTooltip>
        )
    } else {
        return (
            <span>{props.sampleToCCFValue[props.sampleIds[0]]}</span>
        )
    }      
};

export default CancerCellFractionElement;
