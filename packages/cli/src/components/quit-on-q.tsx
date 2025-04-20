import React from 'react'
import {Text, useApp, useInput} from 'ink'

export function QuitOnQ() {
	const {exit} = useApp()

	useInput((input) => {
		if (input === 'q') exit()
	})

	return <Text>press 'q' to quit</Text>
}
