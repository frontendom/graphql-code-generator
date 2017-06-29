import { SelectionSetFieldNode, SelectionSetInlineFragment, SelectionSetItem } from '../types';
import {
  FieldNode, getNamedType, GraphQLSchema, GraphQLType, InlineFragmentNode, SelectionNode,
  SelectionSetNode, typeFromAST
} from 'graphql';
import { FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT } from 'graphql/language/kinds';
import { getFieldDef } from '../utils/get-field-def';
import { resolveType } from '../schema/resolve-type';

export function buildSelectionSet(schema: GraphQLSchema, rootObject: GraphQLType, node: SelectionSetNode): SelectionSetItem[] {
  return (node.selections || []).map((selectionNode: SelectionNode): SelectionSetItem => {
    if (selectionNode.kind === FIELD) {
      const fieldNode = selectionNode as FieldNode;
      const field = getFieldDef(rootObject, fieldNode);
      const resolvedType = resolveType(field.type);

      return {
        name: fieldNode.alias && fieldNode.alias.value ? fieldNode.alias.value : fieldNode.name.value,
        selectionSet: buildSelectionSet(schema, getNamedType(field.type), fieldNode.selectionSet || []),
        arguments: [],
        type: resolvedType.name,
        isRequired: resolvedType.isRequired,
        isArray: resolvedType.isArray,
      } as SelectionSetFieldNode;
    } else if (selectionNode.kind === FRAGMENT_SPREAD) {

    } else if (selectionNode.kind === INLINE_FRAGMENT) {
      const fieldNode = selectionNode as InlineFragmentNode;
      const root = typeFromAST(schema, fieldNode.typeCondition);

      return {
        selectionSet: buildSelectionSet(schema, root, fieldNode.selectionSet),
        onType: fieldNode.typeCondition.name.value,
      } as SelectionSetInlineFragment;
    } else {
      throw new Error(`Unexpected GraphQL type: ${selectionNode.kind}!`);
    }
  });
}