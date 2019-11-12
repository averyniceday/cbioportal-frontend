import * as React from 'react';
import * as _ from 'lodash';
import {If, Else, Then } from 'react-if';
import DefaultTooltip from "public-lib/components/defaultTooltip/DefaultTooltip";
import 'rc-tooltip/assets/bootstrap_white.css';
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import SampleManager from "../../SampleManager";
import {isUncalled} from 'shared/lib/MutationUtils';

export default class PatientCancerCellFractionColumnFormatter {
    static barWidth = 6;
    static barSpacing = 3;
    static maxBarHeight = 12;
    static indexToBarLeft = (n:number) => n*(PatientCancerCellFractionColumnFormatter.barWidth + PatientCancerCellFractionColumnFormatter.barSpacing);

    public static getComponentForSampleArgs<T extends {alleleSpecificCopyNumber:{clonal:boolean}}>(mutation:T) {
        let opacity: number = 1;
        let extraTooltipText: string = '';
        if (mutation.alleleSpecificCopyNumber !== undefined && mutation.alleleSpecificCopyNumber.clonal !== undefined) {
            const clonalValue = mutation.alleleSpecificCopyNumber.clonal;
            if (!clonalValue) {
                opacity = .5;
            }
        }
        return {
            opacity,
            extraTooltipText
         };
    }

    public static convertMutationToSampleElement<T extends {sampleId:string, alleleSpecificCopyNumber:{ccfMCopies:number}}>(mutation:T, color:string, barX:number, sampleComponent:any) {
        if (mutation.alleleSpecificCopyNumber !== undefined && mutation.alleleSpecificCopyNumber.ccfMCopies !== undefined) {
            const ccfMCopies = mutation.alleleSpecificCopyNumber.ccfMCopies;
            const barHeight = (isNaN(ccfMCopies) ? 0 : ccfMCopies)*PatientCancerCellFractionColumnFormatter.maxBarHeight;
            const barY = PatientCancerCellFractionColumnFormatter.maxBarHeight - barHeight;

            const bar = (<rect x={barX} y={barY} width={PatientCancerCellFractionColumnFormatter.barWidth} height={barHeight} fill={color}/>);
            const text = (
                <span>
                    <strong>{ccfMCopies.toFixed(2)}</strong>
                </span>
            );
            return {
                sampleId:mutation.sampleId, bar, component:sampleComponent, text, ccfMCopies
            };
        }
    }

    public static renderFunction(mutations:Mutation[], sampleManager:SampleManager|null) {
        if (!sampleManager) {
            return <span />;
        }

        // for every sample of the selected patient
        // 1) create a "bar" for sample
        // 2) adjust height proportional to CCF value
        // 3) create tooltip with ordered information
        const sampleOrder = sampleManager.getSampleIdsInOrder();
        const barX = sampleOrder.reduce((map, sampleId:string, i:number) => {map[sampleId] = PatientCancerCellFractionColumnFormatter.indexToBarLeft(i); return map;}, {} as {[s:string]:number});
        const sampleElements = mutations.map((m:Mutation) => {
            const args = PatientCancerCellFractionColumnFormatter.getComponentForSampleArgs(m);
            return PatientCancerCellFractionColumnFormatter.convertMutationToSampleElement(
                m,
                sampleManager.getColorForSample(m.sampleId),
                barX[m.sampleId],
                sampleManager.getComponentForSample(m.sampleId, args.opacity, args.extraTooltipText)
            );
        });
        const sampleToElements = sampleElements.reduce((map, elements:any) => {if (elements) { map[elements.sampleId] = elements } return map; }, {} as {[s:string]:any});
        const elementsInSampleOrder = sampleOrder.map((sampleId:string) => sampleToElements[sampleId]).filter((x:any) => !!x);
        const tooltipLines = elementsInSampleOrder.map((elements:any)=>(<span key={elements.sampleId}>{elements.component}  {elements.text}<br/></span>));
        const ccfMCopiesValues = sampleOrder.map((sampleId:string) => (sampleToElements[sampleId] && sampleToElements[sampleId].ccfMCopies) || undefined);
        const bars = elementsInSampleOrder.map((elements:any)=>elements.bar);

        let content:JSX.Element = <span />;

        // single sample: just show the number
        if (sampleManager.samples.length === 1) {
            content = <span>{ (!isNaN(ccfMCopiesValues[0]) ? ccfMCopiesValues[0].toFixed(2) : '') }</span>;
        }
        // multiple samples: show a graphical component
        // (if no tooltip info available do not update content)
        else if (tooltipLines.length > 0) {
            content = (
                <svg
                    width={PatientCancerCellFractionColumnFormatter.getSVGWidth(sampleOrder.length)}
                    height={PatientCancerCellFractionColumnFormatter.maxBarHeight}
                >
                    {bars}
                </svg>
            );
        }
        // as long as we have tooltip lines, show tooltip in either cases (single or multiple)
        if (tooltipLines.length > 0)
        {
            const overlay = () => <span>{tooltipLines}</span>;

            content = (
                <DefaultTooltip
                    placement="left"
                    overlay={overlay}
                    arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                    destroyTooltipOnHide={true}
                >
                    {content}
                </DefaultTooltip>
            );
        }

        return content;
    }

    public static getSVGWidth(numSamples:number) {
        return numSamples*PatientCancerCellFractionColumnFormatter.barWidth + (numSamples-1)*PatientCancerCellFractionColumnFormatter.barSpacing
    }
}
