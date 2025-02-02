/*!
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// @ts-nocheck
import { ApolloLink } from '@apollo/client/core';
import type { NextLink, FetchResult } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import type { Observable } from 'zen-observable-ts';

export class NonTerminatingLink extends ApolloLink {

    private contextKey: string;
    private link: ApolloLink;

    constructor(contextKey: string, { link }: { link: ApolloLink }) {
        super();

        this.contextKey = contextKey;
        this.link = link;
    }

    request(operation, forward?: NextLink): Observable<FetchResult> {
        return (setContext(async (_request, prevContext) => {
            const result = await new Promise((resolve, reject) => {
                this.link.request(operation).subscribe({
                    next: resolve,
                    error: reject,
                });
            });

            return {
                ...prevContext,
                [this.contextKey]: result,
            }
        })).request(operation, forward);
    }
}
