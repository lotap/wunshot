import React from 'react'
import {Text} from 'ink'

export function Hello({name = 'world'}: {name?: string}) {
	return (
		<Text>
			Hello, <Text color="green">{name}</Text>!
		</Text>
	)
}
