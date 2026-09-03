import { GraphQLQueryBuilder } from './index';

export const FETCH_VESTING_STATS = new GraphQLQueryBuilder()
    .setName('FetchVestingStats')
    .addVariable('beneficiaryAddress', 'String!')
    .addField(
        'beneficiaryFund',
        { id: '$beneficiaryAddress' },
        [
            'totalAmount',
            'releaseCount'
        ]
    )
    .build();

export const FETCH_FUNDS_RELEASE_EVENTS = new GraphQLQueryBuilder()
    .setName('FetchFundsReleaseEvents')
    .addVariable('beneficiaryAddress', 'String!')
    .addVariable('skip', 'Int')
    .addVariable('first', 'Int')
    .addVariable('orderBy', 'String')
    .addVariable('orderDirection', 'String')
    .addField(
        'fundsReleaseEvents',
        { 
            where: '{ beneficiary: $beneficiaryAddress }',
            skip: '$skip',
            first: '$first',
            orderBy: '$orderBy',
            orderDirection: '$orderDirection'
        },
        [
            'id',
            'beneficiary',
            'amount',
            'timestamp',
            'blockNumber',
            'transactionHash',
            'vestingAddress'
        ]
    )
    .build();
