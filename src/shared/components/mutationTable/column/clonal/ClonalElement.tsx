import * as React from 'react';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import SampleManager from 'pages/patientView/SampleManager';

export enum ClonalColor {
    LIMEGREEN = 'limegreen',
    DIMGREY = 'dimgrey',
    LIGHTGREY = 'lightgrey',
    WHITE = 'white',
}

function getClonalColor(clonalValue: string): ClonalColor {
    switch (clonalValue) {
        case 'clonal':
            return ClonalColor.LIMEGREEN;
        case 'subclonal':
            return ClonalColor.DIMGREY;
        // Indeterminate/NA falls under this case
        default:
            return ClonalColor.LIGHTGREY;
    }
}

export const ClonalElementTooltip: React.FunctionComponent<{
    sampleId: string;
    clonalValue: string;
    ccfExpectedCopies: string;
    sampleManager?: SampleManager | null;
}> = props => {
    const firstColumnStyle = {
        width: 40,
        display: 'inline-block',
    };
    return (
        <div>
            {props.sampleManager ? (
                <div>
                    {props.sampleManager.getComponentForSample(
                        props.sampleId,
                        1,
                        ''
                    )}
                </div>
            ) : null}
            <div>
                <span style={firstColumnStyle}>Clonal</span>
                <strong
                    style={{ color: `${getClonalColor(props.clonalValue)}` }}
                >
                    {props.clonalValue}
                </strong>
            </div>
            <div>
                <span style={firstColumnStyle}>CCF</span>
                <strong>{props.ccfExpectedCopies}</strong>
            </div>
        </div>
    );
};

const ClonalCircle: React.FunctionComponent<{
    clonalValue: string;
}> = props => {
    return (
        <svg height="10" width="10">
            <circle
                cx={5}
                cy={5}
                r={4}
                stroke={getClonalColor(props.clonalValue)}
                stroke-width={1}
                fill={
                    props.clonalValue !== 'subclonal'
                        ? getClonalColor(props.clonalValue)
                        : ClonalColor.WHITE
                }
                opacity={
                    getClonalColor(props.clonalValue) !== ClonalColor.LIGHTGREY
                        ? 100
                        : 0
                }
            />
        </svg>
    );
};

const ClonalElement: React.FunctionComponent<{
    sampleId: string;
    clonalValue: string; //clonal, subclonal, NA
    ccfExpectedCopies: string;
    sampleManager?: SampleManager | null;
}> = props => {
    if (getClonalColor(props.clonalValue) !== ClonalColor.LIGHTGREY) {
        return (
            <DefaultTooltip
                overlay={<ClonalElementTooltip {...props} />}
                placement="left"
            >
                <span>
                    <ClonalCircle clonalValue={props.clonalValue} />
                </span>
            </DefaultTooltip>
        );
    } else {
        return (
            <span>
                <ClonalCircle clonalValue={props.clonalValue} />
            </span>
        );
    }
};

export default ClonalElement;
