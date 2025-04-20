import React from 'react'
import {Text} from 'ink'
import {withActionLayout} from '@/src/components/action-layout'

export function New() {
	return <Text>SELECT: MODEL, JOIN, OP</Text>
}

export const NewAction = withActionLayout(New)
