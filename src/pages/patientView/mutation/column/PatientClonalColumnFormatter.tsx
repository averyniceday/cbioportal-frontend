import * as React from 'react';
import DefaultTooltip from "public-lib/components/defaultTooltip/DefaultTooltip";
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import SampleManager from "../../SampleManager";
import {floatValueIsNA} from "shared/lib/NumberUtils";
import {hasASCNProperty} from "shared/lib/MutationUtils";
import {getClonalValue, getClonalColor, getClonalCircle} from "shared/components/mutationTable/column/ClonalColumnFormatter";

export default class PatientClonalColumnFormatter {

    public static getDisplayValue(mutations:Mutation[], sampleIds:string[], sampleManager:SampleManager) {
        let values:string[] = [];
        const sampleToValue:{[key: string]: any} = {};
        const sampleToCCF:{[key: string]: any} = {};
        for (const mutation of mutations) {
            sampleToValue[mutation.sampleId] = getClonalValue([mutation]);
        }

        for (const mutation of mutations) {
            // check must be done because members without values will not be returned in the backend response
            sampleToCCF[mutation.sampleId] = hasASCNProperty(mutation, "ccfMCopies") ? mutation.alleleSpecificCopyNumber.ccfMCopies : "NA";
        }
        // exclude samples with invalid count value (undefined || empty || lte 0)
        const samplesWithValue = sampleIds.filter(sampleId =>
            sampleToValue[sampleId] && sampleToValue[sampleId].toString().length > 0);

        // single value: just add the actual value only
        let tdValue = null;
        if (!samplesWithValue) {
            return <span />;
        } else if (samplesWithValue.length === 1) {
            tdValue = PatientClonalColumnFormatter.getClonalListElement(samplesWithValue[0], sampleToValue[samplesWithValue[0]], sampleToCCF[samplesWithValue[0]], sampleManager);
        }
        // multiple value: add sample id and value pairs
        else {
            tdValue = samplesWithValue.map((sampleId:string) => {
                return PatientClonalColumnFormatter.getClonalListElement(sampleId, sampleToValue[sampleId], sampleToCCF[sampleId], sampleManager);
            });
        }
        return (
            <span style={{display:'inline-block', minWidth:100}}>
                <ul style={{marginBottom:0}} className="list-inline list-unstyled">{ tdValue }</ul>
            </span>
        );
    }
    
    public static getTooltip(sampleId:string, clonalValue:string, ccfMCopies:string, sampleManager:SampleManager) {
        let clonalColor = getClonalColor(clonalValue);
        return (
                <div>
                    <table>
                        <tr><td style={{paddingRight:10}}>{sampleManager.getComponentForSample(sampleId, 1, "")}</td><td><strong></strong></td></tr>
                        <tr><td style={{paddingRight:5}}>Clonal</td><td><span style={{color: `${clonalColor}`, fontWeight: "bold"}}>{clonalValue}</span></td></tr>
                        <tr><td style={{paddingRight:5}}>CCF</td><td><strong>{ccfMCopies}</strong></td></tr>
                    </table>
                </div>
        );
    }

    public static getClonalListElement(sampleId:string, clonalValue:string, ccfMCopies:string, sampleManager:SampleManager) {
        return (
            <li><DefaultTooltip overlay={PatientClonalColumnFormatter.getTooltip(`${sampleId}`, `${clonalValue}`, `${ccfMCopies}`, sampleManager)} placement="left" arrowContent={<div className="rc-tooltip-arrow-inner"/>}>{getClonalCircle(clonalValue)}</DefaultTooltip></li>
        );
    }

    public static renderFunction(mutations:Mutation[], sampleIds:string[], sampleManager:SampleManager|null) {
        if (!sampleManager) {
            return <span />;
        }
        return PatientClonalColumnFormatter.getDisplayValue(mutations, sampleIds, sampleManager);
    }

    public static getClonalDownload(mutations:Mutation[]): string|string[] {
        let result = [];
        if (mutations) {
            for (let mutation of mutations) {
                result.push(getClonalValue([mutation]));
            }
        }
        return result;
    }
}
