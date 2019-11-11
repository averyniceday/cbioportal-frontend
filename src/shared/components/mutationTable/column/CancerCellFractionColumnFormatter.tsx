import * as React from 'react';
import DefaultTooltip from 'public-lib/components/defaultTooltip/DefaultTooltip';
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import styles from "./mutationType.module.scss";
import getCanonicalMutationType from "public-lib/lib/getCanonicalMutationType";
import {floatValueIsNA} from "shared/lib/NumberUtils";
import {hasASCNProperty} from "shared/lib/MutationUtils";
/**
 * @author Avery Wang
 */
export default class CancerCellFractionColumnFormatter {
    /* Determines the display value by using the impact field.
     *
     * @param data  column formatter data
     * @returns {string}    "CancerCellFraction" text value
     */
    public static getDisplayValue(data:Mutation[]):string {
        return CancerCellFractionColumnFormatter.getCancerCellFractionValue(data);
    }

    public static getCancerCellFractionValue(data:Mutation[]):string {
        return hasASCNProperty(data[0], "ccfMCopies") ? data[0].alleleSpecificCopyNumber.ccfMCopies.toFixed(2) : "";
    }

    public static getTextValue(data:number):string {
        let textValue:string = "";
        if (data) {
            textValue = data.toString();
        }
        return textValue;
    }

    public static renderFunction(data:Mutation[]) {
        // use text for all purposes (display, sort, filter)
        const text:string = CancerCellFractionColumnFormatter.getDisplayValue(data);
        return <span>{text}</span>;
    }
    
    public static getCancerCellFractionDownload(mutations:Mutation[]): string|string[]
    {
        let result = [];
        if (mutations) {
            for (let mutation of mutations) {
                result.push(CancerCellFractionColumnFormatter.getCancerCellFractionValue([mutation]));
            }
        }
        if (result.length == 1) {
            return result[0];
        }
        return result;
    }
}

