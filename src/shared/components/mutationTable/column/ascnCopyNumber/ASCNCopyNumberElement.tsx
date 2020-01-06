import * as React from 'react';
import DefaultTooltip from "public-lib/components/defaultTooltip/DefaultTooltip";
import SampleManager from "pages/patientView/SampleManager";

const ASCNCallTable:{[key:string]:string} = {
    "no WGD,0,0":"Homiodel",
    "no WGD,1,0":"Hetloss",
    "no WGD,2,0":"CNLOH",
    "no WGD,3,0":"CNLOH & Gain",
    "no WGD,4,0":"CNLOH & Gain",
    "no WGD,5,0":"Amp (LOH)",
    "no WGD,6,0":"Amp (LOH)",
    "no WGD,1,1":"Diploid",
    "no WGD,2,1":"Gain",
    "no WGD,3,1":"Gain",
    "no WGD,4,1":"Amp",
    "no WGD,5,1":"Amp",
    "no WGD,6,1":"Amp",
    "no WGD,2,2":"Tetraploid",
    "no WGD,3,2":"Amp",
    "no WGD,4,2":"Amp",
    "no WGD,5,2":"Amp",
    "no WGD,6,2":"Amp",
    "no WGD,3,3":"Amp (Balanced)",
    "no WGD,4,3":"Amp",
    "no WGD,5,3":"Amp",
    "no WGD,6,3":"Amp",
    "WGD,0,0":"Homdel",
    "WGD,1,0":"Loss Before & After",
    "WGD,2,0":"Loss Before",
    "WGD,3,0":"CNLOH Before & Loss",
    "WGD,4,0":"CNLOH Before",
    "WGD,5,0":"CNLOH Before & Gain",
    "WGD,6,0":"Amp (LOH)",
    "WGD,1,1":"Double Loss After",
    "WGD,2,1":"Loss After",
    "WGD,3,1":"CNLOH After",
    "WGD,4,1":"Loss & Gain",
    "WGD,5,1":"Amp",
    "WGD,6,1":"Amp",
    "WGD,2,2":"Tetraploid",
    "WGD,3,2":"Gain",
    "WGD,4,2":"Amp",
    "WGD,5,2":"Amp",
    "WGD,6,2":"Amp",
    "WGD,3,3":"Amp (Balanced)",
    "WGD,4,3":"Amp",
    "WGD,5,3":"Amp",
    "WGD,6,3":"Amp"
}

export enum ASCNCopyNumberColor {
    RED='red',
    LIGHTRED='#e15b5b',
    LIGHTGREY='#BCBCBC',
    LIGHTBLUE='#2a5eea',
    BLUE='blue',
    BLACK='black'
}

enum ASCNCopyNumberOpacity {
    TRANSPARENT=0,
    OPAQUE=100
}
// can ascn copy number be a different case than these
export function getASCNCopyNumberColor(ASCNCopyNumberValue: string): ASCNCopyNumberColor {
    switch (ASCNCopyNumberValue) {
        case '2':
            return ASCNCopyNumberColor.RED;
        case '1':
            return ASCNCopyNumberColor.LIGHTRED;
        case '0':
            return ASCNCopyNumberColor.LIGHTGREY;
        case '-1':
            return ASCNCopyNumberColor.LIGHTBLUE;
        case '2':
            return ASCNCopyNumberColor.BLUE;
        default:
            return ASCNCopyNumberColor.BLACK;
    }
}

function getASCNCopyNumberOpacity(ASCNCopyNumberValue: string): ASCNCopyNumberOpacity {
    switch (ASCNCopyNumberValue) {
        case '2':
        case '1':
        case '0':
        case '-1':
        case '-2':
            return ASCNCopyNumberOpacity.OPAQUE;
        default:
            return ASCNCopyNumberOpacity.TRANSPARENT;
    }
}

function getASCNCopyNumberCall(wgdValue: string, totalCopyNumberValue: string, minorCopyNumberValue: string) {
    const majorCopyNumberValue: string = (+totalCopyNumberValue - +minorCopyNumberValue).toString(); 
    const key: string = [wgdValue, majorCopyNumberValue, minorCopyNumberValue].join(',');
    return key in ASCNCallTable ? ASCNCallTable[key].toLowerCase() : "NA"; 
}

const ASCNCopyNumberElementTooltip: React.FunctionComponent<{
    sampleId: string,
    wgdValue: string,
    totalCopyNumberValue: string,
    minorCopyNumberValue: string,
    ascnCopyNumberValue: string,
    sampleManager?: SampleManager
}> = (props) => {
    const ascnCopyNumberCall: string = getASCNCopyNumberCall(props.wgdValue, props.totalCopyNumberValue, props.minorCopyNumberValue); 
    return (
        <span>
            {props.sampleManager ? (
                <span>{props.sampleManager.getComponentForSample(props.sampleId, 1, "")}{" "}</span>
            ) : null}
            <span>
                <b>{ascnCopyNumberCall}</b>
                {ascnCopyNumberCall !== "NA" ? (
                    <span>{" "}({props.wgdValue} with total copy number of {props.totalCopyNumberValue} and a minor copy number of {props.minorCopyNumberValue})</span>
                ) : null }
            </span>
        </span>
    );
};

const ASCNCopyNumberIcon: React.FunctionComponent<{
    wgdValue: string,
    totalCopyNumberValue: string,
    ascnCopyNumberValue: string
}> = (props) => {
    return (
        <svg width='18' height='20' className='case-label-header'>
            {props.wgdValue === "WGD" ? (
                <svg>
                    <text x='9' y='5' dominantBaseline='middle' fontWeight='bold' textAnchor='middle' fontSize='7' fill='black'>WGD</text>
                </svg>
            ) : null}
            <g transform="translate(3,8)">
                <rect width='12' height='12' rx='15%' ry='15%' fill={getASCNCopyNumberColor(props.ascnCopyNumberValue)} opacity={getASCNCopyNumberOpacity(props.ascnCopyNumberValue)}/>
                <svg>
                    <text x='6' y='7' dominantBaseline='middle' textAnchor='middle' fontSize={9} fill='white'>{props.totalCopyNumberValue}</text>
                </svg>
            </g>
        </svg>
    
    )
};

// this will return an icon as long as ascnCopyNumberValue(icon color), wgdValue(wgd label), totalCopyNumber(icon number) are not "NA"
// this does not enforce an limits on possible numerical values (e.g bad data such as tcn=99 would show up as 99 in the portal)
const ASCNCopyNumberElement: React.FunctionComponent<{
    sampleId: string,
    wgdValue: string,
    totalCopyNumberValue: string,
    minorCopyNumberValue: string,
    ascnCopyNumberValue: string,
    sampleManager?: SampleManager
}> = (props) => {
    let hasAllRequiredValues: boolean = props.totalCopyNumberValue !== "NA" &&
        props.ascnCopyNumberValue !== "NA" &&
        props.wgdValue !== "NA" &&
        getASCNCopyNumberColor(props.ascnCopyNumberValue) !== ASCNCopyNumberColor.BLACK;

    if (hasAllRequiredValues) {
        return (
            <DefaultTooltip overlay={<ASCNCopyNumberElementTooltip {...props}/>} placement="left">
                <span>
                    <ASCNCopyNumberIcon
                        wgdValue={props.wgdValue}
                        totalCopyNumberValue={props.totalCopyNumberValue}
                        ascnCopyNumberValue={props.ascnCopyNumberValue}
                    />
                </span>
            </DefaultTooltip>
        )
    } else {
        return (
            <span>
                <ASCNCopyNumberIcon
                    wgdValue="NA"
                    totalCopyNumberValue=""
                    ascnCopyNumberValue="NA"
                />
            </span>
        )
    }
};

export default ASCNCopyNumberElement;
