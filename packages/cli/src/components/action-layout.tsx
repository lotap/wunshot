import React, {type PropsWithChildren} from 'react'

import {QuitOnQ} from '@/src/components/quit-on-q'
import {Text} from 'ink'

export function ActionLayout({children}: PropsWithChildren) {
	return (
		<>
			<Text color="redBright">
				!!CURRENTLY NONFUNCTIONAL - MOCK COMMANDS ONLY!!
			</Text>
			{children}
			<QuitOnQ />
		</>
	)
}

export function withActionLayout<P extends PropsWithChildren<object>>(
	WrappedComponent: React.ComponentType<P>,
) {
	function ComponentWithActionLayout(props: P) {
		return (
			<ActionLayout>
				<WrappedComponent {...props} />
			</ActionLayout>
		)
	}

	ComponentWithActionLayout.displayName = `withActionLayout${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`
	return ComponentWithActionLayout
}
